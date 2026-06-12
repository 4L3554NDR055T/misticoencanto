// ===== PAINEL ADMINISTRATIVO =====
// Todos os dados são persistidos no servidor via API REST.

let adminAutenticado = false;
let produtosBackup   = [];
let sessionTimer     = null;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min de inatividade

// ===== MODAL DE CONFIRMAÇÃO CUSTOMIZADO =====
function confirmar(msg, onConfirm, opcoes = {}) {
  const { titulo = 'Confirmar ação', icone = '⚠️', corBotao = '#F44336' } = opcoes;

  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', titulo);

  // Usa textContent para evitar XSS — msg pode conter <strong> controlado
  const modalDiv = document.createElement('div');
  modalDiv.className = 'confirm-modal';

  const iconDiv = document.createElement('div');
  iconDiv.className = 'confirm-icon';
  iconDiv.setAttribute('aria-hidden', 'true');
  iconDiv.textContent = icone;

  const tituloEl = document.createElement('h3');
  tituloEl.className = 'confirm-titulo';
  tituloEl.textContent = titulo;

  const msgEl = document.createElement('p');
  msgEl.className = 'confirm-msg';
  msgEl.innerHTML  = msg; // Controlado internamente, não vem de input do usuário

  const actions = document.createElement('div');
  actions.className = 'confirm-actions';

  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'confirm-btn-cancelar';
  btnCancelar.textContent = 'Cancelar';

  const btnOk = document.createElement('button');
  btnOk.className = 'confirm-btn-ok';
  btnOk.style.background = corBotao;
  btnOk.textContent = 'Confirmar';

  actions.appendChild(btnCancelar);
  actions.appendChild(btnOk);
  modalDiv.appendChild(iconDiv);
  modalDiv.appendChild(tituloEl);
  modalDiv.appendChild(msgEl);
  modalDiv.appendChild(actions);
  overlay.appendChild(modalDiv);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('ativo'));
  setTimeout(() => btnOk.focus(), 150);

  const fechar = () => {
    overlay.classList.remove('ativo');
    setTimeout(() => overlay.remove(), 300);
  };

  btnCancelar.addEventListener('click', fechar);
  btnOk.addEventListener('click', () => { fechar(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });
  const escHandler = e => {
    if (e.key === 'Escape') { fechar(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);
}

// ===== SESSÃO =====
function getToken()    { return localStorage.getItem('admin_token'); }
function setToken(t)   { localStorage.setItem('admin_token', t); }
function removeToken() { localStorage.removeItem('admin_token'); }

function resetSessionTimer() {
  clearTimeout(sessionTimer);
  if (!adminAutenticado) return;
  sessionTimer = setTimeout(() => {
    adminAutenticado = false;
    removeToken();
    adminToast('Sessão expirada por inatividade. Faça login novamente.', { icon: '⏰', persistent: true });
    fecharAdminPanel();
  }, SESSION_TIMEOUT);
}

document.addEventListener('click',    resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);

async function verificarSessaoSalva() {
  if (!getToken()) return;
  try {
    await apiFetch('/admin/session');
    adminAutenticado = true;
    resetSessionTimer();
  } catch {
    removeToken();
  }
}

// ===== LOGIN =====
function abrirLoginAdmin() {
  abrirModal('adminLoginModal', 'adminLoginOverlay');
  setTimeout(() => document.getElementById('adminSenha')?.focus(), 150);
}

function fecharLoginAdmin() {
  fecharModal('adminLoginModal', 'adminLoginOverlay');
  document.getElementById('adminSenha').value = '';
}

async function verificarSenhaAdmin() {
  const senhaInput = document.getElementById('adminSenha');
  const senha      = senhaInput?.value?.trim();

  if (!senha) {
    adminToast('Digite a senha!', { icon: '❌', persistent: true });
    return;
  }

  const btn = document.getElementById('btnLoginAdmin');
  if (btn) { btn.disabled = true; btn.textContent = 'Verificando…'; }

  try {
    const data = await apiFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ senha })
    });

    setToken(data.token);
    adminAutenticado = true;
    resetSessionTimer();

    fecharLoginAdmin();
    abrirAdminPanel();
    adminToast('Acesso concedido!', { icon: '✅', duration: 3000 });
  } catch (e) {
    adminToast(e.message || 'Senha incorreta!', { icon: '❌', persistent: true });
    senhaInput.value = '';
    senhaInput.focus();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt" aria-hidden="true"></i> Acessar Painel';
    }
  }
}

function verificarAutenticacaoAdmin() {
  if (!adminAutenticado) {
    adminToast('Faça login primeiro!', { icon: '⚠️', persistent: true });
    abrirLoginAdmin();
    return false;
  }
  return true;
}

// ===== PAINEL =====
async function abrirAdminPanel() {
  if (!adminAutenticado) { abrirLoginAdmin(); return; }
  produtosBackup = JSON.parse(JSON.stringify(produtos));
  atualizarEstatisticasAdmin();
  carregarProdutosAdmin();
  abrirModal('adminPanel', 'adminPanelOverlay');
}

function fecharAdminPanel() {
  fecharModal('adminPanel', 'adminPanelOverlay');
}

// ===== ESTATÍSTICAS =====
function atualizarEstatisticasAdmin() {
  document.getElementById('totalProdutos').textContent  = String(produtos.length);
  document.getElementById('totalEstoque').textContent   = String(produtos.reduce((s, p) => s + (p.estoque || 0), 0));
  document.getElementById('valorTotal').textContent     = `R$ ${fmt(produtos.reduce((s, p) => s + p.preco * (p.estoque || 0), 0))}`;
}

// ===== LISTAR PRODUTOS =====
function carregarProdutosAdmin() {
  const container = document.getElementById('adminProductsList');
  container.innerHTML = '';

  if (!produtos.length) {
    container.innerHTML = `
      <div class="admin-empty">
        <i class="fas fa-box-open" aria-hidden="true"></i>
        <p>Nenhum produto cadastrado</p>
        <div class="admin-empty-actions">
          <button class="btn-admin-add-small" id="btnAddSmall">
            <i class="fas fa-plus" aria-hidden="true"></i> Adicionar primeiro produto
          </button>
        </div>
      </div>`;
    document.getElementById('btnAddSmall')?.addEventListener('click', abrirModalAdicionarProduto);
    return;
  }

  const fragment = document.createDocumentFragment();
  produtos.forEach((produto, index) => {
    const card = document.createElement('div');
    card.className = 'admin-product-card';
    card.setAttribute('role', 'listitem');

    // Imagem
    const imgDiv = document.createElement('div');
    imgDiv.className = 'admin-product-img';
    const img = document.createElement('img');
    img.src     = produto.img;
    img.alt     = produto.nome;
    img.loading = 'lazy';
    imgDiv.appendChild(img);

    // Info
    const info = document.createElement('div');
    info.className = 'admin-product-info';

    const h4 = document.createElement('h4');
    h4.textContent = produto.nome;

    const details = document.createElement('div');
    details.className = 'admin-product-details';

    const price = document.createElement('span');
    price.className   = 'admin-product-price';
    price.textContent = `R$ ${fmt(produto.preco)}`;

    const stock = document.createElement('span');
    stock.className   = 'admin-product-stock';
    stock.textContent = `Estoque: ${produto.estoque || 0}`;

    details.appendChild(price);
    details.appendChild(stock);

    const tags = document.createElement('div');
    tags.className = 'admin-product-tags';
    [
      Array.isArray(produto.tamanhos) ? produto.tamanhos.join(', ') : (produto.tamanho || ''),
      produto.tecido,
      Array.isArray(produto.cores) ? produto.cores.join(', ') : (produto.cor || ''),
      produto.estilo
    ].forEach(txt => {
      const span = document.createElement('span');
      span.className   = 'tag';
      span.textContent = txt;
      tags.appendChild(span);
    });

    info.appendChild(h4);
    info.appendChild(details);
    info.appendChild(tags);

    // Ações
    const actions = document.createElement('div');
    actions.className = 'admin-product-actions';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-admin-edit';
    btnEditar.title = 'Editar produto';
    btnEditar.setAttribute('aria-label', `Editar ${produto.nome}`);
    btnEditar.innerHTML = '<i class="fas fa-edit" aria-hidden="true"></i>';
    btnEditar.addEventListener('click', () => abrirModalEditarProduto(index));

    const btnDeletar = document.createElement('button');
    btnDeletar.className = 'btn-admin-delete';
    btnDeletar.title = 'Remover produto';
    btnDeletar.setAttribute('aria-label', `Remover ${produto.nome}`);
    btnDeletar.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i>';
    btnDeletar.addEventListener('click', () => removerProduto(produto.id));

    const btnVer = document.createElement('button');
    btnVer.className = 'btn-admin-view';
    btnVer.title = 'Ver no site';
    btnVer.setAttribute('aria-label', `Ver ${produto.nome} no site`);
    btnVer.innerHTML = '<i class="fas fa-eye" aria-hidden="true"></i>';
    btnVer.addEventListener('click', () => verProdutoNoSite(index));

    actions.appendChild(btnEditar);
    actions.appendChild(btnDeletar);
    actions.appendChild(btnVer);

    card.appendChild(imgDiv);
    card.appendChild(info);
    card.appendChild(actions);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

function filtrarProdutosAdmin(termo) {
  clearTimeout(window._adminBuscaTimer);
  window._adminBuscaTimer = setTimeout(() => {
    const t = termo.toLowerCase();
    document.querySelectorAll('#adminProductsList .admin-product-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(t) ? 'flex' : 'none';
    });
  }, 250);
}

// ===== CRUD =====
function abrirModalAdicionarProduto() {
  if (!verificarAutenticacaoAdmin()) return;
  const titulo = document.getElementById('produtoModalTitulo');
  if (titulo) titulo.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> Adicionar Produto';
  document.getElementById('produtoForm')?.reset();
  document.getElementById('produtoId').value     = '';
  document.getElementById('produtoEstoque').value = '10';
  _ocultarPreviewImagem();
  abrirModal('produtoModal', 'produtoModalOverlay');
  document.getElementById('produtoNome')?.focus();
}

function abrirModalEditarProduto(index) {
  if (!verificarAutenticacaoAdmin()) return;
  const p = produtos[index];
  if (!p) return;

  const titulo = document.getElementById('produtoModalTitulo');
  if (titulo) titulo.innerHTML = '<i class="fas fa-edit" aria-hidden="true"></i> Editar Produto';

  document.getElementById('produtoId').value       = p.id;
  document.getElementById('produtoNome').value     = p.nome;
  document.getElementById('produtoPreco').value    = p.preco;
  document.getElementById('produtoCores').value    = Array.isArray(p.cores) ? p.cores.join(', ') : (p.cor || '');
  document.getElementById('produtoTamanhos').value = Array.isArray(p.tamanhos) ? p.tamanhos.join(', ') : (p.tamanho || '');
  document.getElementById('produtoTecido').value   = p.tecido;
  document.getElementById('produtoEstilo').value   = p.estilo;
  document.getElementById('produtoEstoque').value  = String(p.estoque || 0);
  document.getElementById('produtoImagem').value   = p.img;
  _atualizarPreviewImagem(p.img);

  abrirModal('produtoModal', 'produtoModalOverlay');
}

function fecharModalProduto() {
  fecharModal('produtoModal', 'produtoModalOverlay');
  _ocultarPreviewImagem();
}

// Preview de imagem em tempo real
function _atualizarPreviewImagem(url) {
  const wrap    = document.getElementById('imagePreviewWrap');
  const preview = document.getElementById('imagePreview');
  if (!wrap || !preview) return;
  if (!url) { _ocultarPreviewImagem(); return; }

  preview.onerror = () => _ocultarPreviewImagem();
  preview.onload  = () => wrap.removeAttribute('hidden');
  preview.src = url;
}

function _ocultarPreviewImagem() {
  const wrap = document.getElementById('imagePreviewWrap');
  if (wrap) wrap.setAttribute('hidden', '');
}

async function salvarProduto(event) {
  event.preventDefault();
  if (!verificarAutenticacaoAdmin()) return;

  const id      = document.getElementById('produtoId').value;
  const payload = {
    nome:     document.getElementById('produtoNome').value.trim(),
    preco:    parseFloat(document.getElementById('produtoPreco').value),
    cores:    document.getElementById('produtoCores').value.split(',').map(s => s.trim()).filter(Boolean),
    tamanhos: document.getElementById('produtoTamanhos').value.split(',').map(s => s.trim()).filter(Boolean),
    tecido:   document.getElementById('produtoTecido').value,
    estilo:   document.getElementById('produtoEstilo').value,
    estoque:  parseInt(document.getElementById('produtoEstoque').value) || 0,
    img:      document.getElementById('produtoImagem').value.trim()
  };

  const btn = document.querySelector('.btn-salvar');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando…'; }

  try {
    if (!id) {
      const data = await apiFetch('/admin/produtos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      produtos.push(data.produto);
      adminToast('Produto adicionado!', { icon: '✅', duration: 3000 });
    } else {
      const data = await apiFetch(`/admin/produtos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      const idx = produtos.findIndex(p => String(p.id) === String(id));
      if (idx !== -1) produtos[idx] = data.produto;
      adminToast('Produto atualizado!', { icon: '✅', duration: 3000 });
    }

    atualizarEstatisticasAdmin();
    carregarProdutosAdmin();
    renderizar();
    fecharModalProduto();
  } catch (e) {
    adminToast(e?.message || 'Erro ao salvar produto.', { icon: '❌', persistent: true });
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> Salvar Produto'; }
  }
}

function editarProduto(index) {
  if (!verificarAutenticacaoAdmin()) return;
  abrirModalEditarProduto(index);
}

async function removerProduto(id) {
  if (!verificarAutenticacaoAdmin()) return;
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;

  confirmar(
    `Remover <strong>"${produto.nome}"</strong>? Esta ação não pode ser desfeita.`,
    async () => {
      try {
        await apiFetch(`/admin/produtos/${id}`, { method: 'DELETE' });
        produtos = produtos.filter(p => p.id !== id);
        adminToast('Produto removido!', { icon: '🗑️', duration: 3000 });
        atualizarEstatisticasAdmin();
        carregarProdutosAdmin();
        renderizar();
      } catch (e) {
        adminToast(e?.message || 'Erro ao remover produto.', { icon: '❌', persistent: true });
      }
    },
    { titulo: 'Remover produto?', icone: '🗑️' }
  );
}

async function limparTodosProdutosAdmin() {
  if (!verificarAutenticacaoAdmin()) return;
  if (!produtos.length) { adminToast('Não há produtos para limpar!', { icon: 'ℹ️' }); return; }

  confirmar(
    `Todos os <strong>${produtos.length} produtos</strong> serão removidos permanentemente. Esta ação é irreversível.`,
    async () => {
      try {
        await apiFetch('/admin/produtos', { method: 'DELETE' });
        produtos = [];
        adminToast('Todos os produtos foram removidos!', { icon: '🗑️', duration: 4000 });
        atualizarEstatisticasAdmin();
        carregarProdutosAdmin();
        renderizar();
      } catch (e) {
        adminToast(e?.message || 'Erro ao limpar produtos.', { icon: '❌', persistent: true });
      }
    },
    { titulo: 'Limpar TODOS os produtos?', icone: '⚠️' }
  );
}

async function adicionarProdutosExemplo() {
  if (!verificarAutenticacaoAdmin()) return;
  const exemplos = [
    { nome: 'Babydoll Renda Vermelha Sensual', preco: 89.90, cores: ['vermelho', 'preto'], tamanhos: ['P', 'M', 'G'],    tecido: 'renda',   estilo: 'babydoll', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70&auto=format', estoque: 15 },
    { nome: 'Camisola Preto Luxo Elegante',    preco: 129.90, cores: ['preto'],            tamanhos: ['M', 'G', 'GG'],   tecido: 'cetim',   estilo: 'camisola', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&q=70&auto=format', estoque: 8  },
    { nome: 'Camisola Rosa Delicada',          preco: 99.90,  cores: ['rosa'],             tamanhos: ['P', 'M'],         tecido: 'chiffon', estilo: 'camisola', img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&q=70&auto=format', estoque: 12 }
  ];

  confirmar(
    `Adicionar <strong>${exemplos.length} produtos de exemplo</strong> ao catálogo?`,
    async () => {
      try {
        for (let i = 0; i < exemplos.length; i++) {
          progressToast('Adicionando exemplos', i + 1, exemplos.length);
          const data = await apiFetch('/admin/produtos', {
            method: 'POST',
            body: JSON.stringify(exemplos[i])
          });
          produtos.push(data.produto);
        }
        adminToast(`${exemplos.length} produtos adicionados!`, { icon: '✅', duration: 3000 });
        atualizarEstatisticasAdmin();
        carregarProdutosAdmin();
        renderizar();
      } catch (e) {
        adminToast(e?.message || 'Erro ao adicionar exemplos.', { icon: '❌', persistent: true });
      }
    },
    { titulo: 'Adicionar exemplos?', icone: '✨', corBotao: '#9C27B0' }
  );
}

function verProdutoNoSite(index) {
  fecharAdminPanel();
  verDetalhes(index);
}

// ===== EXPORT / IMPORT =====
function exportarProdutos() {
  if (!verificarAutenticacaoAdmin()) return;
  const dados = { produtos, exportadoEm: new Date().toISOString(), totalProdutos: produtos.length };
  const blob  = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `produtos-mistico-encanto-${new Date().toISOString().split('T')[0]}.json`;
  a.rel       = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  adminToast('Produtos exportados!', { icon: '📥', duration: 3000 });
}

function importarProdutos() {
  if (!verificarAutenticacaoAdmin()) return;
  const input  = document.createElement('input');
  input.type   = 'file';
  input.accept = '.json';
  input.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    // Valida tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      adminToast('Arquivo muito grande (máx 5MB).', { icon: '❌', persistent: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const dados = JSON.parse(e.target.result);
        if (!dados.produtos || !Array.isArray(dados.produtos))
          throw new Error('Formato inválido: campo "produtos" ausente ou não é um array.');

        confirmar(
          `Importar <strong>${dados.produtos.length} produtos</strong>? Os produtos atuais serão substituídos.`,
          async () => {
            try {
              const data = await apiFetch('/admin/produtos', {
                method: 'PUT',
                body: JSON.stringify({ produtos: dados.produtos })
              });
              await carregarProdutos();
              adminToast(`${data.total} produtos importados!`, { icon: '📤', duration: 3000 });
              atualizarEstatisticasAdmin();
              carregarProdutosAdmin();
            } catch (err) {
              adminToast(`Erro ao importar: ${err?.message || err}`, { icon: '❌', persistent: true });
            }
          },
          { titulo: 'Importar produtos?', icone: '📁', corBotao: '#39b54a' }
        );
      } catch (err) {
        adminToast(`Erro ao importar: ${err?.message || err}`, { icon: '❌', persistent: true });
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async () => {
  await verificarSessaoSalva();

  // Vincular botões do painel admin (sem inline handlers no HTML)
  document.getElementById('btnLoginAdmin')?.addEventListener('click', verificarSenhaAdmin);
  document.getElementById('btnFecharLoginAdmin')?.addEventListener('click', fecharLoginAdmin);
  document.getElementById('adminLoginOverlay')?.addEventListener('click', fecharLoginAdmin);

  document.getElementById('btnFecharAdmin')?.addEventListener('click', fecharAdminPanel);
  document.getElementById('adminPanelOverlay')?.addEventListener('click', fecharAdminPanel);

  document.getElementById('btnAdicionarProduto')?.addEventListener('click', abrirModalAdicionarProduto);
  document.getElementById('btnLimparTodos')?.addEventListener('click', limparTodosProdutosAdmin);
  document.getElementById('btnProdutosExemplo')?.addEventListener('click', adicionarProdutosExemplo);
  document.getElementById('btnExportar')?.addEventListener('click', exportarProdutos);
  document.getElementById('btnImportar')?.addEventListener('click', importarProdutos);
  document.getElementById('btnNotificacoes')?.addEventListener('click', abrirHistoricoNotificacoes);

  document.getElementById('btnFecharModalProduto')?.addEventListener('click', fecharModalProduto);
  document.getElementById('produtoModalOverlay')?.addEventListener('click', fecharModalProduto);
  document.getElementById('btnCancelarProduto')?.addEventListener('click', fecharModalProduto);

  // Preview de imagem em tempo real
  document.getElementById('produtoImagem')?.addEventListener('input', function () {
    clearTimeout(window._previewTimer);
    window._previewTimer = setTimeout(() => _atualizarPreviewImagem(this.value.trim()), 600);
  });

  // Form submit
  document.getElementById('produtoForm')?.addEventListener('submit', salvarProduto);

  // Busca no painel admin com debounce
  document.getElementById('adminBusca')?.addEventListener('input', function () {
    filtrarProdutosAdmin(this.value);
  });

  // Enter no campo de senha
  document.getElementById('adminSenha')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') verificarSenhaAdmin();
  });
});
