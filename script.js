// ===== API =====
const API = '/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res  = await fetch(API + path, { ...options, headers, signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== DADOS =====
let produtos = [];

async function carregarProdutos() {
  mostrarSkeleton();
  try {
    const data = await apiFetch('/produtos?limit=500');
    // API retorna { produtos, pagination } ou array legado
    produtos = Array.isArray(data) ? data : (data.produtos || []);
    renderizar();
  } catch (e) {
    tratarErro(e, 'render');
  } finally {
    removerSkeleton();
  }
}

// ===== SKELETON LOADER =====
function mostrarSkeleton() {
  const grid = document.getElementById('produtos');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 8 }, () =>
    `<div class="card skeleton-card" aria-hidden="true">
       <div class="skeleton skeleton-img"></div>
       <div class="card-body">
         <div class="skeleton skeleton-title"></div>
         <div class="skeleton skeleton-price"></div>
         <div class="skeleton skeleton-tags"></div>
       </div>
     </div>`
  ).join('');
}

function removerSkeleton() {
  document.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

// ===== ESTADO =====
let carrinho   = carregarLocalStorage('lux_carrinho', []);
let filtros    = { cor: '', preco: '', tamanho: '', tecido: '', estilo: '', ordem: '' };
let textoBusca = '';
let pagina     = 1;
const POR_PAGINA = 50;

// ===== NOTIFICAÇÕES / TOAST =====
let toastTimer;
let notificationHistory = carregarLocalStorage('lux_notifications', []);
const MAX_HISTORY = 50;

function toast(msg, tipo = 'info', options = {}) {
  const el     = document.getElementById('toast');
  const config = { duration: 2800, persistent: false, ...options };

  // Sanitiza a mensagem antes de exibir (só texto, nunca HTML)
  const texto = config.icon ? `${config.icon} ${msg}` : msg;
  el.textContent = texto;
  el.className   = `toast toast-${tipo} visivel`;
  if (config.persistent) el.classList.add('toast-persistent');

  addToNotificationHistory({ message: msg, type: tipo, timestamp: new Date().toISOString() });

  clearTimeout(toastTimer);
  if (!config.persistent) {
    toastTimer = setTimeout(() => el.classList.remove('visivel'), config.duration);
  }
}

function addToNotificationHistory(n) {
  notificationHistory.unshift(n);
  if (notificationHistory.length > MAX_HISTORY)
    notificationHistory = notificationHistory.slice(0, MAX_HISTORY);
  salvarLocalStorage('lux_notifications', notificationHistory);
  updateNotificationBadge();
}

function getNotificationHistory(limit = 20) {
  return notificationHistory.slice(0, limit);
}

function clearNotificationHistory() {
  notificationHistory = [];
  salvarLocalStorage('lux_notifications', notificationHistory);
  updateNotificationBadge();
  toast('Histórico limpo!', 'info');
}

function updateNotificationBadge() {
  const badge  = document.getElementById('notificationBadge');
  if (!badge) return;
  const unread = notificationHistory.filter(n => !n.read).length;
  badge.textContent = unread > 9 ? '9+' : String(unread);
  if (unread > 0) {
    badge.removeAttribute('hidden');
    badge.setAttribute('aria-label', `${unread} notificações não lidas`);
  } else {
    badge.setAttribute('hidden', '');
  }
}

function markNotificationsAsRead() {
  notificationHistory.forEach(n => (n.read = true));
  salvarLocalStorage('lux_notifications', notificationHistory);
  updateNotificationBadge();
  loadNotificationsList();
}

function adminToast(msg, options = {}) {
  return toast(msg, 'admin', { icon: '⚙️', ...options });
}

function abrirHistoricoNotificacoes() {
  if (!verificarAutenticacaoAdmin()) return;
  abrirModal('notificationsModal', 'notificationsModalOverlay');
  loadNotificationsList();
  markNotificationsAsRead();
}

function fecharHistoricoNotificacoes() {
  fecharModal('notificationsModal', 'notificationsModalOverlay');
}

function loadNotificationsList() {
  const container     = document.getElementById('notificationsList');
  const countElement  = document.getElementById('notificationsCount');
  const unreadElement = document.getElementById('notificationsUnread');
  const notifications = getNotificationHistory(20);
  const unread        = notifications.filter(n => !n.read).length;

  countElement.textContent  = `${notifications.length} notificação${notifications.length !== 1 ? 'ões' : ''}`;
  unreadElement.textContent = `${unread} não lida${unread !== 1 ? 's' : ''}`;

  if (!notifications.length) {
    container.innerHTML = `
      <div class="notification-empty">
        <i class="fas fa-bell-slash" aria-hidden="true"></i>
        <p>Nenhuma notificação ainda</p>
        <small>As notificações do painel admin aparecerão aqui</small>
      </div>`;
    return;
  }

  // Usa textContent para as mensagens — nunca innerHTML direto de dados externos
  container.innerHTML = '';
  notifications.forEach(n => {
    const item = document.createElement('div');
    item.className = `notification-item ${n.type || 'info'} ${n.read ? '' : 'unread'}`;
    item.setAttribute('role', 'listitem');

    const header = document.createElement('div');
    header.className = 'notification-header';

    const left = document.createElement('div');
    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = n.icon || '📢';
    const strong = document.createElement('strong');
    strong.textContent = (n.type || 'info').toUpperCase();
    left.appendChild(icon);
    left.appendChild(strong);

    const time = document.createElement('span');
    time.className = 'notification-time';
    time.textContent = getTimeAgo(n.timestamp);

    header.appendChild(left);
    header.appendChild(time);

    const msg = document.createElement('div');
    msg.className = 'notification-message';
    msg.textContent = n.message; // textContent — sem XSS

    item.appendChild(header);
    item.appendChild(msg);
    container.appendChild(item);
  });
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'agora';
  if (m < 60) return `${m} min atrás`;
  if (h < 24) return `${h}h atrás`;
  if (d < 7)  return `${d} dia${d !== 1 ? 's' : ''} atrás`;
  return new Date(timestamp).toLocaleDateString('pt-BR');
}

function progressToast(msg, progress, total) {
  const pct = Math.round((progress / total) * 100);
  const el  = document.getElementById('toast');
  el.textContent = `${msg} (${progress}/${total} — ${pct}%)`;
  el.className   = 'toast toast-info toast-progress visivel';
  if (progress === total) setTimeout(() => el.classList.remove('visivel'), 1000);
}

// ===== TRATAMENTO DE ERRO =====
function tratarErro(erro, contexto) {
  console.error(`[siteSther] Erro em ${contexto}:`, erro);
  const mensagens = {
    network: 'Erro de conexão. Verifique sua internet.',
    storage: 'Erro ao salvar dados locais.',
    render:  'Erro ao carregar produtos. Recarregue a página.',
    default: 'Ocorreu um erro. Tente novamente.'
  };
  toast(mensagens[contexto] || mensagens.default, 'error');
}

// ===== LOCAL STORAGE =====
function salvarLocalStorage(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
    return true;
  } catch (e) {
    // Quota excedida — remove notificações antigas e tenta novamente
    if (e.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem('lux_notifications');
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
      } catch { /* nada */ }
    }
    console.warn('[siteSther] localStorage indisponível:', e);
    return false;
  }
}

function carregarLocalStorage(chave, padrao = []) {
  try {
    const d = localStorage.getItem(chave);
    return d ? JSON.parse(d) : padrao;
  } catch { return padrao; }
}

// ===== FILTRAR / ORDENAR =====
function getListaFiltrada() {
  let lista = produtos.filter(p => {
    if (textoBusca && !p.nome.toLowerCase().includes(textoBusca.toLowerCase())) return false;
    if (filtros.cor) {
      const cores = Array.isArray(p.cores) ? p.cores : [p.cor];
      if (!cores.some(c => c.toLowerCase() === filtros.cor.toLowerCase())) return false;
    }
    if (filtros.tamanho) {
      const tamanhos = Array.isArray(p.tamanhos) ? p.tamanhos : [p.tamanho];
      if (!tamanhos.includes(filtros.tamanho)) return false;
    }
    if (filtros.tecido  && p.tecido !== filtros.tecido)  return false;
    if (filtros.estilo  && p.estilo !== filtros.estilo)  return false;
    if (filtros.preco === 'baixo'  && p.preco > 80)                    return false;
    if (filtros.preco === 'medio'  && (p.preco <= 80 || p.preco > 110)) return false;
    if (filtros.preco === 'alto'   && p.preco <= 110)                   return false;
    return true;
  });

  if (filtros.ordem === 'menor') lista.sort((a, b) => a.preco - b.preco);
  if (filtros.ordem === 'maior') lista.sort((a, b) => b.preco - a.preco);
  if (filtros.ordem === 'az')    lista.sort((a, b) => a.nome.localeCompare(b.nome));
  return lista;
}

let buscaTimeout;
function buscar(texto) {
  textoBusca = (typeof texto === 'string' ? texto : '').replace(/[<>"'`]/g, '').trim().substring(0, 100);
  pagina = 1;
  const clearBtn = document.getElementById('buscaClear');
  if (clearBtn) {
    if (texto.length > 0) clearBtn.removeAttribute('hidden');
    else clearBtn.setAttribute('hidden', '');
  }
  clearTimeout(buscaTimeout);
  buscaTimeout = setTimeout(renderizar, 300);
}

function limparBusca() {
  textoBusca = '';
  const input = document.getElementById('busca');
  if (input) { input.value = ''; input.focus(); }
  const clearBtn = document.getElementById('buscaClear');
  if (clearBtn) clearBtn.setAttribute('hidden', '');
  renderizar();
}

function aplicarFiltros() {
  pagina = 1;
  atualizarBadgeFiltros();
  renderizar();
}

function limparFiltros() {
  filtros    = { cor: '', preco: '', tamanho: '', tecido: '', estilo: '', ordem: '' };
  textoBusca = '';
  const busca = document.getElementById('busca');
  if (busca) busca.value = '';
  document.querySelectorAll('.filtros select').forEach(s => (s.value = ''));
  const clearBtn = document.getElementById('buscaClear');
  if (clearBtn) clearBtn.setAttribute('hidden', '');
  pagina = 1;
  atualizarBadgeFiltros();
  renderizar();
}

function atualizarBadgeFiltros() {
  const ativos = Object.values(filtros).filter(v => v !== '').length;
  const badge  = document.getElementById('filtrosBadge');
  if (!badge) return;
  badge.textContent = String(ativos);
  if (ativos > 0) badge.removeAttribute('hidden');
  else badge.setAttribute('hidden', '');
  // Atualizar aria-expanded do botão de filtros
  const btn = document.getElementById('btnFiltros');
  if (btn) btn.setAttribute('aria-label', ativos > 0 ? `Filtros (${ativos} ativos)` : 'Abrir filtros');
}

// ===== RENDERIZAR =====
function renderizar() {
  const lista    = getListaFiltrada();
  const grid     = document.getElementById('produtos');
  const semRes   = document.getElementById('sem-resultado');
  const contagem = document.getElementById('contagem-produtos');

  // Guarda foco se veio de paginação
  grid.innerHTML = '';

  contagem.textContent = lista.length
    ? `${lista.length} produto${lista.length > 1 ? 's' : ''}`
    : '';

  if (!lista.length) {
    semRes.removeAttribute('hidden');
    document.getElementById('paginacao').innerHTML = '';
    return;
  }
  semRes.setAttribute('hidden', '');

  // Proteção contra pagina inválida
  const totalPag = Math.ceil(lista.length / POR_PAGINA);
  if (pagina > totalPag) pagina = totalPag;

  const inicio = (pagina - 1) * POR_PAGINA;
  const itens  = lista.slice(inicio, inicio + POR_PAGINA);

  // Usa event delegation no grid (evita memory leak com muitos listeners)
  grid.removeEventListener('click', _gridClickHandler);
  grid.addEventListener('click', _gridClickHandler);

  const fragment = document.createDocumentFragment();

  itens.forEach(p => {
    const idx = produtos.indexOf(p);
    if (idx === -1) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    card.dataset.idx = idx;

    // Sanitiza dados antes de inserir
    const nomeEsc  = escHtml(p.nome);
    const estiloEsc = escHtml(p.estilo || '');
    const tecidoEsc = escHtml(p.tecido || '');
    const tag1 = escHtml(Array.isArray(p.tamanhos) ? p.tamanhos[0] : (p.tamanho || ''));
    const tag2 = escHtml(Array.isArray(p.cores)    ? p.cores[0]    : (p.cor    || ''));

    card.innerHTML = `
      <div class="card-img-wrap" data-estilo="${estiloEsc}">
        <img class="img-bg" src="" aria-hidden="true" loading="lazy" decoding="async">
        <img class="img-principal" src="" alt="${nomeEsc}" loading="lazy" decoding="async">
      </div>
      <div class="card-body">
        <h3>${nomeEsc}</h3>
        <p class="price">R$ ${fmt(p.preco)}</p>
        <div class="card-tags">
          <span class="tag">${tag1}</span>
          <span class="tag">${tecidoEsc}</span>
          <span class="tag">${tag2}</span>
        </div>
        <div class="card-btns">
          <button class="btn-add" data-action="add" data-idx="${idx}" aria-label="Adicionar ${nomeEsc} ao carrinho">
            <i class="fas fa-plus" aria-hidden="true"></i> Adicionar
          </button>
          <button class="btn-ver" data-action="ver" data-idx="${idx}" aria-label="Ver detalhes de ${nomeEsc}">
            <i class="fas fa-eye" aria-hidden="true"></i> Ver
          </button>
        </div>
      </div>`;

    // Lazy load seguro — define src só após criar o elemento
    const imgs = card.querySelectorAll('img');
    imgs[0].src = p.img; // img-bg
    imgs[1].src = p.img; // img-principal

    const wrap = card.querySelector('.card-img-wrap');
    if (imgs[1].complete && imgs[1].naturalWidth > 0) {
      wrap.classList.add('loaded');
    } else {
      imgs[1].addEventListener('load',  () => wrap.classList.add('loaded'), { once: true });
      imgs[1].addEventListener('error', () => {
        wrap.classList.add('loaded');
        wrap.innerHTML = `<div class="img-fallback" aria-label="Imagem não disponível">✦</div>`;
      }, { once: true });
    }

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
  renderPaginacao(lista.length);
}

// Handler centralizado para cliques nos cards (event delegation)
function _gridClickHandler(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);
  if (isNaN(idx)) return;
  if (btn.dataset.action === 'add') add(idx);
  if (btn.dataset.action === 'ver') verDetalhes(idx);
}

function renderPaginacao(total) {
  const totalPag = Math.ceil(total / POR_PAGINA);
  const nav = document.getElementById('paginacao');
  if (totalPag <= 1) { nav.innerHTML = ''; return; }

  nav.innerHTML = '';
  Array.from({ length: totalPag }, (_, i) => {
    const btn = document.createElement('button');
    btn.textContent = String(i + 1);
    btn.dataset.p   = i + 1;
    if (i + 1 === pagina) {
      btn.classList.add('ativo');
      btn.setAttribute('aria-current', 'page');
    }
    btn.addEventListener('click', () => {
      pagina = i + 1;
      renderizar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    nav.appendChild(btn);
  });
}

// ===== UTILIDADES =====
function fmt(n) { return Number(n).toFixed(2).replace('.', ','); }

/** Escapa caracteres HTML para evitar XSS */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ===== CARRINHO =====
function add(idx) {
  if (idx < 0 || idx >= produtos.length) return;
  const p    = produtos[idx];
  const item = carrinho.find(i => i.id === p.id);
  if (item) { item.qtd++; }
  else { carrinho.push({ id: p.id, nome: p.nome, preco: p.preco, qtd: 1 }); }
  salvarCarrinho();
  atualizarCarrinho();
  animarBadge();
  toast(`✅ ${p.nome} adicionado!`);
}

function remover(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  salvarCarrinho();
  atualizarCarrinho();
}

function alterarQtd(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) { remover(id); return; }
  salvarCarrinho();
  atualizarCarrinho();
}

function limparCarrinho() {
  if (!carrinho.length) { toast('⚠️ O carrinho já está vazio!'); return; }
  confirmar(
    'Todos os itens serão removidos do carrinho.',
    () => {
      carrinho = [];
      salvarCarrinho();
      atualizarCarrinho();
      toast('Carrinho limpo!');
    },
    { titulo: 'Limpar carrinho?', icone: '🛒', corBotao: '#e6396f' }
  );
}

function salvarCarrinho() {
  salvarLocalStorage('lux_carrinho', carrinho);
}

function atualizarCarrinho() {
  const div   = document.getElementById('carrinho');
  const total = document.getElementById('total');
  const count = document.getElementById('count');

  count.textContent = String(carrinho.reduce((s, i) => s + i.qtd, 0));

  if (!carrinho.length) {
    div.innerHTML = `<div class="carrinho-vazio"><i class="fas fa-shopping-bag" aria-hidden="true"></i><p>Carrinho vazio</p></div>`;
    total.textContent = '0,00';
    return;
  }

  let soma = 0;
  div.innerHTML = '';
  carrinho.forEach(item => {
    const sub = item.preco * item.qtd;
    soma += sub;
    const el = document.createElement('div');
    el.className = 'item-carrinho';

    const nomeEl  = document.createElement('span');
    nomeEl.className = 'item-nome';
    nomeEl.textContent = item.nome; // textContent — sem XSS

    const precoEl = document.createElement('span');
    precoEl.className = 'item-preco';
    precoEl.textContent = `R$ ${fmt(item.preco)} × ${item.qtd} = R$ ${fmt(sub)}`;

    const qtdEl = document.createElement('div');
    qtdEl.className = 'item-qtd';

    const btnMenos = document.createElement('button');
    btnMenos.textContent = '−';
    btnMenos.setAttribute('aria-label', `Diminuir quantidade de ${item.nome}`);
    btnMenos.addEventListener('click', () => alterarQtd(item.id, -1));

    const qtdSpan = document.createElement('span');
    qtdSpan.textContent = String(item.qtd);

    const btnMais = document.createElement('button');
    btnMais.textContent = '+';
    btnMais.setAttribute('aria-label', `Aumentar quantidade de ${item.nome}`);
    btnMais.addEventListener('click', () => alterarQtd(item.id, 1));

    qtdEl.appendChild(btnMenos);
    qtdEl.appendChild(qtdSpan);
    qtdEl.appendChild(btnMais);

    const btnRem = document.createElement('button');
    btnRem.className = 'btn-remover';
    btnRem.setAttribute('aria-label', `Remover ${item.nome} do carrinho`);
    btnRem.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i> Remover';
    btnRem.addEventListener('click', () => remover(item.id));

    el.appendChild(nomeEl);
    el.appendChild(precoEl);
    el.appendChild(qtdEl);
    el.appendChild(btnRem);
    div.appendChild(el);
  });
  total.textContent = fmt(soma);
}

function animarBadge() {
  const b = document.getElementById('count');
  if (!b) return;
  b.style.transform = 'scale(1.7)';
  setTimeout(() => (b.style.transform = 'scale(1)'), 220);
}

function toggleCart() {
  const cartBox = document.getElementById('cartBox');
  const overlay = document.getElementById('cartOverlay');
  const btn     = document.getElementById('btnCarrinho');
  const aberto  = cartBox.classList.toggle('ativo');
  overlay.classList.toggle('ativo', aberto);
  overlay.setAttribute('aria-hidden', aberto ? 'false' : 'true');
  cartBox.setAttribute('aria-hidden', aberto ? 'false' : 'true');
  if (btn) btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  if (aberto) {
    // Foca no primeiro elemento focável do carrinho
    setTimeout(() => document.getElementById('btnFecharCart')?.focus(), 100);
  }
}

function toggleFiltros() {
  const panel   = document.getElementById('filtrosPanel');
  const overlay = document.getElementById('filtrosOverlay');
  const btn     = document.getElementById('btnFiltros');
  const aberto  = panel.classList.toggle('aberto');
  overlay.classList.toggle('ativo', aberto);
  panel.setAttribute('aria-hidden', aberto ? 'false' : 'true');
  overlay.setAttribute('aria-hidden', aberto ? 'false' : 'true');
  if (btn) btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  if (aberto) {
    setTimeout(() => document.getElementById('btnFecharFiltros')?.focus(), 100);
  }
}

function finalizar() {
  if (!carrinho.length) { toast('⚠️ Seu carrinho está vazio!'); return; }
  const totalTxt = document.getElementById('total').textContent;
  const itens    = carrinho.map(i => `• ${i.nome} (x${i.qtd}) — R$ ${fmt(i.preco * i.qtd)}`).join('\n');
  const msg      = encodeURIComponent(`Olá! Gostaria de fazer um pedido:\n\n${itens}\n\n*Total: R$ ${totalTxt}*`);
  const numero   = (window.SiteConfig?.CONTACT?.WHATSAPP) || '';
  if (!numero || numero === 'SEU_NUMERO_AQUI') {
    toast('⚠️ WhatsApp não configurado. Contate o administrador.', 'warning');
    return;
  }
  window.open(`https://wa.me/${numero}?text=${msg}`, '_blank', 'noopener,noreferrer');
}

// ===== HELPERS DE MODAL (genérico) =====
const _lastFocusMap = {};

function abrirModal(modalId, overlayId) {
  const modal   = document.getElementById(modalId);
  const overlay = document.getElementById(overlayId);
  if (!modal) return;
  _lastFocusMap[modalId] = document.activeElement;
  modal.classList.add('ativo');
  modal.setAttribute('aria-hidden', 'false');
  if (overlay) {
    overlay.classList.add('ativo');
    overlay.setAttribute('aria-hidden', 'false');
  }
  // Foca no primeiro elemento focável
  const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  setTimeout(() => focusable?.focus(), 100);
}

function fecharModal(modalId, overlayId) {
  const modal   = document.getElementById(modalId);
  const overlay = overlayId ? document.getElementById(overlayId) : null;
  if (!modal) return;
  modal.classList.remove('ativo');
  modal.setAttribute('aria-hidden', 'true');
  if (overlay) {
    overlay.classList.remove('ativo');
    overlay.setAttribute('aria-hidden', 'true');
  }
  // Restaura foco ao elemento que abriu o modal
  const last = _lastFocusMap[modalId];
  if (last?.focus) last.focus();
}

// ===== MODAL PRODUTO =====
function verDetalhes(idx) {
  if (idx < 0 || idx >= produtos.length) return;
  const p = produtos[idx];
  const img = document.getElementById('modal-img');
  img.src = p.img;
  img.alt = p.nome;

  document.getElementById('modal-estilo').textContent = (p.estilo || '').toUpperCase();
  document.getElementById('modal-nome').textContent   = p.nome;
  document.getElementById('modal-preco').textContent  = `R$ ${fmt(p.preco)}`;

  const cores    = Array.isArray(p.cores)    ? p.cores.join(', ')    : (p.cor    || '');
  const tamanhos = Array.isArray(p.tamanhos) ? p.tamanhos.join(', ') : (p.tamanho || '');
  const tagsEl   = document.getElementById('modal-tags');
  tagsEl.innerHTML = '';
  [
    `Cores: ${cores}`,
    `Tamanhos: ${tamanhos}`,
    `Tecido: ${p.tecido}`,
    `Estilo: ${p.estilo}`
  ].forEach(txt => {
    const span = document.createElement('span');
    span.className   = 'tag';
    span.textContent = txt;
    tagsEl.appendChild(span);
  });

  document.getElementById('modal-btn').onclick = () => { add(idx); fecharModal('modal', 'modalOverlay'); };

  abrirModal('modal', 'modalOverlay');
}

// ===== PARTÍCULAS (desativa quando a aba não está visível) =====
function criarParticulas() {
  // Não criar partículas se usuário prefere movimento reduzido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let container = document.querySelector('.particles-container');
  if (!container) return;
  container.innerHTML = '';
  const cores = ['var(--dourado)', 'var(--rosa)', 'var(--rosa-claro)', 'var(--dourado-claro)'];
  for (let i = 0; i < 30; i++) { // Reduzido de 50 para 30
    const p   = document.createElement('div');
    p.className = 'particle';
    p.setAttribute('aria-hidden', 'true');
    const size = Math.random() * 10 + 3;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%; top:${Math.random() * 100}%;
      background:${cores[Math.floor(Math.random() * cores.length)]};
      animation-delay:${Math.random() * 20}s;
      animation-duration:${Math.random() * 15 + 20}s;
      opacity:${Math.random() * 0.12 + 0.04};
      ${size > 8 ? 'filter:blur(1px)' : ''}`;
    container.appendChild(p);
  }

  // Pausar partículas quando aba não está visível (poupa CPU/bateria)
  document.addEventListener('visibilitychange', () => {
    container.style.animationPlayState = document.hidden ? 'paused' : 'running';
    container.querySelectorAll('.particle').forEach(p => {
      p.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  });
}

// ===== SCROLL / CONTADORES / BOTÃO TOPO =====
function initScrollSuave() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href   = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });
}

function animarContadores() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const stat   = entry.target;
      const raw    = stat.textContent;
      const target = parseInt(raw.replace(/\D/g, ''), 10);
      if (isNaN(target)) return;
      let current = 0;
      const inc   = target / 50;
      const timer = setInterval(() => {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        const floor = Math.floor(current);
        stat.textContent = raw.includes('+') ? `+${floor}`
          : raw.includes('%') ? `${floor}%`
          : String(floor);
      }, 20);
      observer.unobserve(stat);
    });
  }, { threshold: 0.5 });
  stats.forEach(s => observer.observe(s));
}

function initBotaoTopo() {
  const btn = document.createElement('button');
  btn.className   = 'btn-topo';
  btn.innerHTML   = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
  btn.setAttribute('aria-label', 'Voltar ao topo da página');
  btn.setAttribute('title', 'Voltar ao topo');
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => btn.classList.toggle('visivel', window.scrollY > 300), { passive: true });
}

// ===== LOADING =====
function initLoading() {
  const loading = document.getElementById('loading');
  if (!loading) return;
  const hide = () => {
    loading.classList.add('hidden');
    loading.setAttribute('aria-hidden', 'true');
  };
  window.addEventListener('load', () => setTimeout(hide, 500));
  setTimeout(hide, 5000); // fallback
}

// ===== SERVICE WORKER =====
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

// ===== VINCULAR LINKS DINÂMICOS (WhatsApp no footer) =====
function vincularLinksConfig() {
  const numero = window.SiteConfig?.CONTACT?.WHATSAPP;
  if (numero && numero !== 'SEU_NUMERO_AQUI') {
    const linkWA = document.getElementById('linkWhatsapp');
    if (linkWA) linkWA.href = `https://wa.me/${numero}`;
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  // --- Carrinho ---
  atualizarCarrinho();

  // --- Produtos ---
  await carregarProdutos();

  // --- Loading + partículas + UI ---
  initLoading();
  criarParticulas();
  initScrollSuave();
  animarContadores();
  initBotaoTopo();
  initServiceWorker();
  vincularLinksConfig();

  // ===== EVENT LISTENERS (sem inline handlers) =====

  // Busca
  const inputBusca = document.getElementById('busca');
  if (inputBusca) inputBusca.addEventListener('input', e => buscar(e.target.value));
  document.getElementById('buscaClear')?.addEventListener('click', limparBusca);

  // Filtros
  document.getElementById('btnFiltros')?.addEventListener('click', toggleFiltros);
  document.getElementById('btnFecharFiltros')?.addEventListener('click', toggleFiltros);
  document.getElementById('filtrosOverlay')?.addEventListener('click', toggleFiltros);
  document.getElementById('btnLimparFiltros')?.addEventListener('click', limparFiltros);
  document.getElementById('btnLimparFiltrosInline')?.addEventListener('click', limparFiltros);

  // Selects de filtro
  document.getElementById('filtroOrdem')?.addEventListener('change', e => { filtros.ordem = e.target.value; aplicarFiltros(); });
  document.getElementById('filtroCor')?.addEventListener('change',   e => { filtros.cor   = e.target.value; aplicarFiltros(); });
  document.getElementById('filtroPreco')?.addEventListener('change', e => { filtros.preco = e.target.value; aplicarFiltros(); });
  document.getElementById('filtroTamanho')?.addEventListener('change', e => { filtros.tamanho = e.target.value; aplicarFiltros(); });
  document.getElementById('filtroTecido')?.addEventListener('change', e => { filtros.tecido  = e.target.value; aplicarFiltros(); });
  document.getElementById('filtroEstilo')?.addEventListener('change', e => { filtros.estilo  = e.target.value; aplicarFiltros(); });

  // Hero tags (filtros rápidos)
  document.querySelectorAll('.hero-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { filtro, valor } = btn.dataset;
      if (filtro && valor) {
        filtros[filtro] = valor;
        aplicarFiltros();
        document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Carrinho
  document.getElementById('btnCarrinho')?.addEventListener('click', toggleCart);
  document.getElementById('btnFecharCart')?.addEventListener('click', toggleCart);
  document.getElementById('cartOverlay')?.addEventListener('click', toggleCart);
  document.getElementById('btnFinalizar')?.addEventListener('click', finalizar);
  document.getElementById('btnLimparCarrinho')?.addEventListener('click', limparCarrinho);

  // Modal produto
  document.getElementById('btnFecharModal')?.addEventListener('click', () => fecharModal('modal', 'modalOverlay'));
  document.getElementById('modalOverlay')?.addEventListener('click', () => fecharModal('modal', 'modalOverlay'));

  // Footer – admin
  document.getElementById('btnAbrirAdmin')?.addEventListener('click', () => abrirLoginAdmin());

  // Notificações
  document.getElementById('btnLimparNotificacoes')?.addEventListener('click', clearNotificationHistory);
  document.getElementById('btnMarcarLidas')?.addEventListener('click', markNotificationsAsRead);
  document.getElementById('btnFecharNotificacoes')?.addEventListener('click', fecharHistoricoNotificacoes);
  document.getElementById('btnFecharNotificacoesFooter')?.addEventListener('click', fecharHistoricoNotificacoes);
  document.getElementById('notificationsModalOverlay')?.addEventListener('click', fecharHistoricoNotificacoes);

  // Fechar modais com ESC
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    fecharModal('modal', 'modalOverlay');
    if (document.getElementById('filtrosPanel')?.classList.contains('aberto')) toggleFiltros();
    if (document.getElementById('cartBox')?.classList.contains('ativo')) toggleCart();
  });

  // Barra de busca mobile — colapsa ao clicar fora
  (function () {
    const wrap  = document.querySelector('.header-busca-wrap');
    if (!wrap) return;
    const icon  = wrap.querySelector('.header-busca-icon');
    const input = wrap.querySelector('.header-busca');

    function collapse() { wrap.classList.remove('expanded'); input?.blur(); }

    icon?.addEventListener('click', e => {
      if (window.matchMedia('(max-width:500px)').matches) {
        e.stopPropagation();
        const expanded = wrap.classList.toggle('expanded');
        if (expanded) setTimeout(() => input?.focus(), 180);
      }
    });
    input?.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => { if (wrap.classList.contains('expanded')) collapse(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') collapse(); });
  })();
});
