// Carrega .env se existir
try { require('dotenv').config(); } catch {}

const express        = require('express');
const path           = require('path');
const cors           = require('cors');
const crypto         = require('crypto');
const { MongoClient } = require('mongodb');

// Compressão opcional (instale com: npm install compression)
let compression;
try { compression = require('compression'); } catch { compression = null; }

const app = express();

// Confia no proxy reverso (Render, Heroku, Nginx) para obter IP real
app.set('trust proxy', 1);

// ===== CONFIGURAÇÕES =====
const PORT              = parseInt(process.env.PORT || '3001', 10);
const MONGO_URI         = process.env.MONGO_URI || '';
const SESSION_DURATION  = parseInt(process.env.SESSION_HOURS || '8', 10) * 60 * 60 * 1000;
const RATE_LIMIT_MAX    = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_MINUTES || '15', 10) * 60 * 1000;
const ALLOWED_ORIGINS   = (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim());

if (!MONGO_URI) {
  console.error('❌ MONGO_URI não definida. Configure a variável de ambiente.');
  process.exit(1);
}

// ===== MONGODB =====
let db;
let mongoClient; // referência para graceful shutdown

async function conectarDB() {
  mongoClient = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10
  });
  await mongoClient.connect();
  db = mongoClient.db('mistico_encanto');
  console.log('✓ MongoDB conectado');

  // Garantir índices para melhor performance
  await db.collection('config').createIndex({ chave: 1 }, { unique: true });
  await db.collection('produtos').createIndex({ id: 1 }, { unique: true });
  await db.collection('produtos').createIndex({ criadoEm: -1 });
  await db.collection('produtos').createIndex({ estilo: 1 });
  await db.collection('produtos').createIndex({ tecido: 1 });
  await db.collection('produtos').createIndex({ estilo: 1, tecido: 1 }); // compound para filtros combinados

  // Seed do admin se não existir
  const adminExiste = await db.collection('config').findOne({ chave: 'admin' });
  if (!adminExiste) {
    const senhaPadrao = process.env.ADMIN_PASSWORD || 'MisticoEncanto@2025';
    await db.collection('config').insertOne({
      chave: 'admin',
      passwordHash: hashPassword(senhaPadrao)
    });
    console.log(`✓ Admin criado. Senha: ${senhaPadrao}`);
    console.log('  ⚠️  Defina ADMIN_PASSWORD no painel do Render antes de publicar!');
  }
}

// ===== MIDDLEWARES =====
if (compression) {
  app.use(compression({ level: 6, threshold: 1024 }));
}

app.use(cors({
  origin: ALLOWED_ORIGINS.includes('*') ? '*' : ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

app.use(express.json({ limit: '50kb' }));

// Cache de arquivos estáticos (imagens, fontes, etc.)
app.use(express.static(path.join(__dirname), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    // HTML não tem cache agressivo para garantir atualizações
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// ===== AUTENTICAÇÃO =====
const SALT = process.env.HASH_SALT || 'mistico_encanto_salt_2025';

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, SALT, 100000, 64, 'sha512').toString('hex');
}

const sessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession() {
  const token = generateToken();
  sessions.set(token, { expiresAt: Date.now() + SESSION_DURATION });
  return token;
}

function requireAdmin(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });

  const session = sessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  session.expiresAt = Date.now() + SESSION_DURATION;
  next();
}

// ===== RATE LIMITING =====
const loginAttempts = new Map();

function rateLimit(req, res, next) {
  const ip    = req.ip || req.connection.remoteAddress;
  const now   = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT_MAX) {
      const wait = Math.ceil((entry.resetAt - now) / 1000);
      return res.status(429).json({ error: `Muitas tentativas. Aguarde ${wait}s.` });
    }
    entry.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }
  next();
}

// ===== SANITIZAÇÃO =====
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`]/g, '').trim().slice(0, 500);
}

function sanitizeProduto(body) {
  const cores = Array.isArray(body.cores)
    ? body.cores.map(c => sanitize(String(c))).filter(Boolean)
    : [sanitize(String(body.cores || ''))].filter(Boolean);

  const tamanhos = Array.isArray(body.tamanhos)
    ? body.tamanhos.map(t => sanitize(String(t))).filter(Boolean)
    : [sanitize(String(body.tamanhos || ''))].filter(Boolean);

  return {
    nome:    sanitize(body.nome    || ''),
    preco:   parseFloat(body.preco),
    tecido:  sanitize(body.tecido  || ''),
    estilo:  sanitize(body.estilo  || ''),
    img:     sanitize(body.img     || ''),
    estoque: parseInt(body.estoque) || 0,
    cores,
    tamanhos
  };
}

function validarProduto(p) {
  const TECIDOS = ['renda', 'cetim', 'chiffon', 'malha'];
  const ESTILOS = ['babydoll', 'camisola'];
  if (!p.nome || p.nome.length < 3 || p.nome.length > 200)
    return 'Nome deve ter entre 3 e 200 caracteres.';
  if (isNaN(p.preco) || p.preco <= 0 || p.preco > 10000)
    return 'Preço deve estar entre R$ 0,01 e R$ 10.000,00.';
  if (!p.cores.length)    return 'Informe ao menos uma cor.';
  if (!p.tamanhos.length) return 'Informe ao menos um tamanho.';
  if (!TECIDOS.includes(p.tecido)) return 'Tecido inválido. Use: ' + TECIDOS.join(', ');
  if (!ESTILOS.includes(p.estilo)) return 'Estilo inválido. Use: ' + ESTILOS.join(', ');
  if (!p.img)             return 'URL da imagem é obrigatória.';
  if (p.estoque < 0 || p.estoque > 10000) return 'Estoque entre 0 e 10.000.';
  return null;
}

// ===== ROTAS PÚBLICAS =====

// Health check — usado pelo UptimeRobot para manter o servidor acordado
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Listar produtos — suporte a paginação e filtros básicos
app.get('/api/produtos', async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit    = Math.min(200, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const skip     = (page - 1) * limit;
    const estilo   = req.query.estilo  ? String(req.query.estilo).slice(0, 50)  : null;
    const tecido   = req.query.tecido  ? String(req.query.tecido).slice(0, 50)  : null;
    const q        = req.query.q       ? String(req.query.q).slice(0, 100)      : null;

    const filter = {};
    if (estilo) filter.estilo = estilo;
    if (tecido) filter.tecido = tecido;
    if (q)      filter.nome  = { $regex: q, $options: 'i' };

    const [produtos, total] = await Promise.all([
      db.collection('produtos')
        .find(filter, { projection: { _id: 0 } })
        .sort({ criadoEm: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('produtos').countDocuments(filter)
    ]);

    // Cache leve para visitantes (5 min, revalidação obrigatória)
    res.setHeader('Cache-Control', 'private, max-age=300, must-revalidate');

    res.json({
      produtos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

// Login admin
app.post('/api/admin/login', rateLimit, async (req, res) => {
  try {
    const senha = req.body.senha || '';
    if (!senha) return res.status(400).json({ error: 'Informe a senha.' });

    const adminDoc = await db.collection('config').findOne({ chave: 'admin' });
    if (!adminDoc || adminDoc.passwordHash !== hashPassword(senha))
      return res.status(401).json({ error: 'Senha incorreta.' });

    res.json({ success: true, token: createSession() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// Logout
app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  sessions.delete(token);
  res.json({ success: true });
});

// Verificar sessão
app.get('/api/admin/session', requireAdmin, (req, res) => res.json({ valid: true }));

// ===== ROTAS PROTEGIDAS =====

// Adicionar produto
app.post('/api/admin/produtos', requireAdmin, async (req, res) => {
  try {
    const produto = sanitizeProduto(req.body);
    const erro    = validarProduto(produto);
    if (erro) return res.status(400).json({ error: erro });

    produto.id       = Date.now();
    produto.criadoEm = new Date().toISOString();

    await db.collection('produtos').insertOne({ ...produto });
    res.status(201).json({ success: true, produto });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao adicionar produto.' });
  }
});

// Atualizar produto
app.put('/api/admin/produtos/:id', requireAdmin, async (req, res) => {
  try {
    const id      = Number(req.params.id);
    const atual   = await db.collection('produtos').findOne({ id }, { projection: { _id: 0 } });
    if (!atual) return res.status(404).json({ error: 'Produto não encontrado.' });

    const atualizado = sanitizeProduto(req.body);
    const erro       = validarProduto(atualizado);
    if (erro) return res.status(400).json({ error: erro });

    atualizado.id           = id;
    atualizado.criadoEm     = atual.criadoEm;
    atualizado.atualizadoEm = new Date().toISOString();

    await db.collection('produtos').replaceOne({ id }, atualizado);
    res.json({ success: true, produto: atualizado });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Remover produto
app.delete('/api/admin/produtos/:id', requireAdmin, async (req, res) => {
  try {
    const id     = Number(req.params.id);
    const result = await db.collection('produtos').deleteOne({ id });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao remover produto.' });
  }
});

// Limpar todos os produtos
app.delete('/api/admin/produtos', requireAdmin, async (req, res) => {
  try {
    const result = await db.collection('produtos').deleteMany({});
    res.json({ success: true, removidos: result.deletedCount });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao limpar produtos.' });
  }
});

// Importar produtos (substitui tudo)
app.put('/api/admin/produtos', requireAdmin, async (req, res) => {
  try {
    if (!Array.isArray(req.body.produtos))
      return res.status(400).json({ error: 'Envie um array em "produtos".' });

    const importados = [];
    for (const p of req.body.produtos) {
      const s    = sanitizeProduto(p);
      const erro = validarProduto(s);
      if (erro) return res.status(400).json({ error: `Produto inválido: ${erro}` });
      s.id       = p.id       || Date.now() + Math.random();
      s.criadoEm = p.criadoEm || new Date().toISOString();
      importados.push(s);
    }

    await db.collection('produtos').deleteMany({});
    if (importados.length) await db.collection('produtos').insertMany(importados);
    res.json({ success: true, total: importados.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao importar produtos.' });
  }
});

// Alterar senha do admin
app.put('/api/admin/senha', requireAdmin, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha)
      return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });

    const adminDoc = await db.collection('config').findOne({ chave: 'admin' });
    if (!adminDoc || adminDoc.passwordHash !== hashPassword(senhaAtual))
      return res.status(401).json({ error: 'Senha atual incorreta.' });

    if (novaSenha.length < 8)
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 8 caracteres.' });

    await db.collection('config').updateOne(
      { chave: 'admin' },
      { $set: { passwordHash: hashPassword(novaSenha) } }
    );
    sessions.clear();
    res.json({ success: true, message: 'Senha alterada. Faça login novamente.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

// ===== LIMPEZA DE SESSÕES =====
setInterval(() => {
  const now = Date.now();
  sessions.forEach((s, t) => { if (now > s.expiresAt) sessions.delete(t); });
}, 60 * 60 * 1000);

// ===== GRACEFUL SHUTDOWN =====
async function shutdown(signal) {
  console.log(`\n[${signal}] Encerrando servidor...`);
  if (mongoClient) {
    await mongoClient.close().catch(() => {});
    console.log('✓ MongoDB desconectado');
  }
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException',  err => { console.error('Erro não tratado:', err.message); shutdown('uncaughtException'); });
process.on('unhandledRejection', err => { console.error('Promise rejeitada:', err);        shutdown('unhandledRejection'); });

// ===== INICIAR =====
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✦ Místico Encanto → http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err.message);
  process.exit(1);
});
