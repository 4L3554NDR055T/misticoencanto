/**
 * config.js — Configurações do site Místico Encanto
 *
 * ⚠️  ANTES DE PUBLICAR: substitua "SEU_NUMERO_AQUI" pelo número
 *     real no formato internacional, ex: "5511999998888"
 *     (sem +, sem espaços, sem traços)
 */

const SITE_CONFIG = {

  /* ── Informações do Site ───────────────────── */
  SITE_INFO: {
    NAME:        'Místico Encanto',
    DESCRIPTION: 'Loja online de camisolas e babydolls de luxo em renda, cetim e chiffon',
    URL:         'https://misticoencanto.com',
    AUTHOR:      'Místico Encanto',
    KEYWORDS:    'camisola, babydoll, lingerie, renda, cetim, chiffon, luxo, moda íntima'
  },

  /* ── Contato ───────────────────────────────── */
  CONTACT: {
    WHATSAPP:  'SEU_NUMERO_AQUI',          // Ex: "5511999998888"
    INSTAGRAM: 'https://instagram.com/misticoencanto',
    FACEBOOK:  'https://facebook.com/misticoencanto',
    PINTEREST: 'https://pinterest.com/misticoencanto',
    EMAIL:     'contato@misticoencanto.com'
  },

  /* ── Negócio ───────────────────────────────── */
  BUSINESS: {
    CURRENCY:           'R$',
    DECIMAL_SEPARATOR:  ',',
    THOUSANDS_SEPARATOR:'.',
    SHIPPING_TIME:      '24h',
    RETURN_POLICY_DAYS: 30,
    MINIMUM_ORDER:      0
  },

  /* ── Carrinho ──────────────────────────────── */
  CART: {
    MAX_ITEMS:           50,
    SHOW_TAX:            false,
    TAX_PERCENTAGE:      0,
    SHIPPING_COST:       0,
    FREE_SHIPPING_MINIMUM: 0
  },

  /* ── Produtos ──────────────────────────────── */
  PRODUCTS: {
    ITEMS_PER_PAGE:      50,
    SHOW_OUT_OF_STOCK:   true,
    LOW_STOCK_THRESHOLD: 5
  },

  /* ── Imagens ───────────────────────────────── */
  IMAGES: {
    ALLOWED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    MAX_SIZE:        5 * 1024 * 1024, // 5 MB
    LAZY_LOAD:       true
  },

  /* ── Analytics (opcional) ─────────────────── */
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: '',
    FACEBOOK_PIXEL_ID:   '',
  },

  /* ── Desenvolvimento ───────────────────────── */
  DEVELOPMENT: {
    DEBUG_MODE: false
  }
};

/* ─── Helpers ──────────────────────────────────── */
const ConfigHelper = {

  /** Formata preço para exibição (ex: "R$ 89,90") */
  formatPrice(price) {
    return `${SITE_CONFIG.BUSINESS.CURRENCY} ${Number(price)
      .toFixed(2)
      .replace('.', SITE_CONFIG.BUSINESS.DECIMAL_SEPARATOR)}`;
  },

  /** Gera URL do WhatsApp com mensagem opcional */
  getWhatsAppURL(message = '') {
    const num = SITE_CONFIG.CONTACT.WHATSAPP;
    if (!num || num === 'SEU_NUMERO_AQUI') return '#';
    const txt = encodeURIComponent(
      message || `Olá, gostaria de informações sobre a ${SITE_CONFIG.SITE_INFO.NAME}`
    );
    return `https://wa.me/${num}?text=${txt}`;
  },

  /** Retorna true se rodando em localhost / modo debug */
  isDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      SITE_CONFIG.DEVELOPMENT.DEBUG_MODE
    );
  },

  /** Valida se o WhatsApp está configurado */
  isWhatsAppConfigured() {
    const n = SITE_CONFIG.CONTACT.WHATSAPP;
    return Boolean(n) && n !== 'SEU_NUMERO_AQUI' && /^\d{10,15}$/.test(n);
  },

  /** Acesso seguro a qualquer propriedade de config via path dotado */
  get(configPath, defaultValue = null) {
    return configPath.split('.').reduce((obj, key) => {
      return obj != null && obj[key] !== undefined ? obj[key] : defaultValue;
    }, SITE_CONFIG);
  }
};

/* ─── Exporta globalmente ──────────────────────── */
window.SiteConfig   = SITE_CONFIG;
window.ConfigHelper = ConfigHelper;

/* ─── Inicialização ────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Aviso em dev se WhatsApp não estiver configurado
  if (ConfigHelper.isDevelopment()) {
    if (!ConfigHelper.isWhatsAppConfigured()) {
      console.warn(
        '[Místico Encanto] ⚠️ WhatsApp não configurado.\n' +
        'Edite CONTACT.WHATSAPP em config.js com o número real (ex: "5511999998888").'
      );
    }
    console.info('[Místico Encanto] Modo de desenvolvimento ativo.');
  }

  // Google Analytics (se configurado)
  if (SITE_CONFIG.ANALYTICS.GOOGLE_ANALYTICS_ID && typeof gtag !== 'undefined') {
    gtag('config', SITE_CONFIG.ANALYTICS.GOOGLE_ANALYTICS_ID);
  }
});
