// Configurações de Segurança Avançada para Místico Encanto
// Este arquivo contém configurações de segurança que devem ser implementadas no backend

// ===== CONFIGURAÇÕES DE SEGURANÇA =====

const SECURITY_CONFIG = {
    // Autenticação
    AUTH: {
        // Em produção, usar backend com bcrypt e JWT
        // Esta é apenas uma implementação frontend básica
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
        PASSWORD_MIN_LENGTH: 12,
        REQUIRE_COMPLEX_PASSWORD: true,
        PASSWORD_COMPLEXITY: {
            minLength: 12,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        }
    },
    
    // Rate Limiting
    RATE_LIMIT: {
        API_REQUESTS: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100 // máximo de requisições por IP
        },
        LOGIN_ATTEMPTS: {
            windowMs: 60 * 60 * 1000, // 1 hora
            max: 5 // máximo de tentativas de login
        },
        ADMIN_ACTIONS: {
            windowMs: 5 * 60 * 1000, // 5 minutos
            max: 20 // máximo de ações administrativas
        }
    },
    
    // Validação de Dados
    VALIDATION: {
        PRODUCT: {
            NAME_MAX_LENGTH: 200,
            PRICE_MIN: 0.01,
            PRICE_MAX: 10000,
            STOCK_MIN: 0,
            STOCK_MAX: 1000,
            IMAGE_URL_PATTERN: /^https:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i,
            ALLOWED_FABRICS: ['renda', 'cetim', 'chiffon', 'malha'],
            ALLOWED_STYLES: ['babydoll', 'camisola']
        },
        USER_INPUT: {
            MAX_LENGTH: 500,
            SANITIZE_PATTERNS: [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /javascript:/gi,
                /data:/gi,
                /vbscript:/gi,
                /on\w+\s*=/gi
            ]
        }
    },
    
    // Headers de Segurança
    SECURITY_HEADERS: {
        CSP: "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline'; style-src 'self' https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self';",
        HSTS: "max-age=31536000; includeSubDomains; preload",
        X_FRAME_OPTIONS: "SAMEORIGIN",
        X_CONTENT_TYPE_OPTIONS: "nosniff",
        X_XSS_PROTECTION: "1; mode=block",
        REFERRER_POLICY: "strict-origin-when-cross-origin",
        PERMISSIONS_POLICY: "camera=(), microphone=(), geolocation=(), payment=()"
    },
    
    // Logging e Auditoria
    AUDIT: {
        LOG_ADMIN_ACTIONS: true,
        LOG_LOGIN_ATTEMPTS: true,
        LOG_DATA_CHANGES: true,
        LOG_ERRORS: true,
        RETENTION_DAYS: 90
    },
    
    // Backup
    BACKUP: {
        AUTO_BACKUP: true,
        BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
        MAX_BACKUPS: 30,
        BACKUP_FORMAT: 'json'
    },
    
    // Criptografia
    ENCRYPTION: {
        // Em produção, usar backend para criptografia
        // Esta é apenas para desenvolvimento
        USE_LOCAL_STORAGE_ENCRYPTION: false, // Desativado por padrão (requer backend)
        ENCRYPTION_KEY: null // Deve ser definido no backend
    }
};

// ===== FUNÇÕES DE SEGURANÇA =====

/**
 * Gera um token CSRF para proteção contra ataques
 * @returns {string} Token CSRF
 */
function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida um token CSRF
 * @param {string} token - Token a ser validado
 * @param {string} storedToken - Token armazenado
 * @returns {boolean} True se válido
 */
function validateCSRFToken(token, storedToken) {
    if (!token || !storedToken) return false;
    return token === storedToken;
}

/**
 * Sanitiza entrada de dados contra XSS
 * @param {string} input - Texto a ser sanitizado
 * @returns {string} Texto sanitizado
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#x60;')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<\s*script/gi, '')
        .replace(/<\s*iframe/gi, '')
        .replace(/<\s*object/gi, '')
        .replace(/<\s*embed/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/url\s*\(/gi, '')
        .trim()
        .substring(0, SECURITY_CONFIG.VALIDATION.USER_INPUT.MAX_LENGTH);
}

/**
 * Valida URL de imagem
 * @param {string} url - URL a ser validada
 * @returns {boolean} True se válida
 */
function validateImageURL(url) {
    try {
        const urlObj = new URL(url);
        
        // Apenas HTTPS
        if (urlObj.protocol !== 'https:') return false;
        
        // Verificar formato de imagem
        const pathname = urlObj.pathname.toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        
        return allowedExtensions.some(ext => pathname.endsWith(ext));
    } catch {
        return false;
    }
}

/**
 * Valida complexidade de senha
 * @param {string} password - Senha a ser validada
 * @returns {Object} Resultado da validação
 */
function validatePasswordComplexity(password) {
    const config = SECURITY_CONFIG.AUTH.PASSWORD_COMPLEXITY;
    const result = {
        isValid: true,
        errors: []
    };
    
    if (password.length < config.minLength) {
        result.isValid = false;
        result.errors.push(`A senha deve ter pelo menos ${config.minLength} caracteres`);
    }
    
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        result.isValid = false;
        result.errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (config.requireLowercase && !/[a-z]/.test(password)) {
        result.isValid = false;
        result.errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (config.requireNumbers && !/\d/.test(password)) {
        result.isValid = false;
        result.errors.push('A senha deve conter pelo menos um número');
    }
    
    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.isValid = false;
        result.errors.push('A senha deve conter pelo menos um caractere especial');
    }
    
    return result;
}

/**
 * Sistema de rate limiting básico
 */
class RateLimiter {
    constructor() {
        this.attempts = new Map();
        this.locks = new Map();
    }
    
    /**
     * Verifica se uma ação é permitida
     * @param {string} key - Chave única (ex: IP + ação)
     * @param {Object} config - Configuração de rate limiting
     * @returns {boolean} True se permitido
     */
    isAllowed(key, config) {
        const now = Date.now();
        
        // Verificar se está bloqueado
        const lockUntil = this.locks.get(key);
        if (lockUntil && now < lockUntil) {
            return false;
        }
        
        // Limpar bloqueios expirados
        if (lockUntil && now >= lockUntil) {
            this.locks.delete(key);
        }
        
        // Obter histórico de tentativas
        let attempts = this.attempts.get(key) || [];
        
        // Remover tentativas antigas
        attempts = attempts.filter(time => now - time < config.windowMs);
        
        // Verificar limite
        if (attempts.length >= config.max) {
            // Bloquear por windowMs
            this.locks.set(key, now + config.windowMs);
            this.attempts.delete(key);
            return false;
        }
        
        // Registrar tentativa atual
        attempts.push(now);
        this.attempts.set(key, attempts);
        
        return true;
    }
    
    /**
     * Limpa tentativas antigas
     */
    cleanup() {
        const now = Date.now();
        
        // Limpar tentativas
        for (const [key, attempts] of this.attempts.entries()) {
            const validAttempts = attempts.filter(time => now - time < 3600000); // 1 hora
            if (validAttempts.length === 0) {
                this.attempts.delete(key);
            } else {
                this.attempts.set(key, validAttempts);
            }
        }
        
        // Limpar bloqueios expirados
        for (const [key, lockUntil] of this.locks.entries()) {
            if (now >= lockUntil) {
                this.locks.delete(key);
            }
        }
    }
}

// Instância global do rate limiter
const rateLimiter = new RateLimiter();

// Limpeza periódica
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000); // A cada 5 minutos

/**
 * Sistema de logging de auditoria
 */
class AuditLogger {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    }
    
    /**
     * Registra uma ação de auditoria
     * @param {string} action - Ação realizada
     * @param {string} user - Usuário que realizou a ação
     * @param {Object} details - Detalhes adicionais
     */
    log(action, user = 'system', details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            user,
            details,
            ip: 'N/A' // Em produção, obter do backend
        };
        
        this.logs.unshift(logEntry);
        
        // Manter apenas os últimos 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(0, 1000);
        }
        
        // Salvar no localStorage (em produção, enviar para backend)
        localStorage.setItem('audit_logs', JSON.stringify(this.logs));
        
        // Log no console para desenvolvimento
        if (SECURITY_CONFIG.AUDIT.LOG_ADMIN_ACTIONS) {
            console.log(`[AUDIT] ${logEntry.timestamp} - ${user} - ${action}`, details);
        }
    }
    
    /**
     * Obtém logs de auditoria
     * @param {number} limit - Número máximo de logs
     * @returns {Array} Logs de auditoria
     */
    getLogs(limit = 50) {
        return this.logs.slice(0, limit);
    }
    
    /**
     * Limpa logs antigos
     * @param {number} daysToKeep - Número de dias para manter
     */
    clearOldLogs(daysToKeep = SECURITY_CONFIG.AUDIT.RETENTION_DAYS) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        this.logs = this.logs.filter(log => 
            new Date(log.timestamp) >= cutoffDate
        );
        
        localStorage.setItem('audit_logs', JSON.stringify(this.logs));
    }
}

// Instância global do logger
const auditLogger = new AuditLogger();

// Limpar logs antigos periodicamente
setInterval(() => auditLogger.clearOldLogs(), 24 * 60 * 60 * 1000); // Diariamente

/**
 * Sistema de backup automático
 */
class AutoBackup {
    constructor() {
        this.lastBackup = localStorage.getItem('last_backup');
        this.backupCount = parseInt(localStorage.getItem('backup_count') || '0');
    }
    
    /**
     * Cria um backup dos dados
     */
    createBackup() {
        if (!SECURITY_CONFIG.BACKUP.AUTO_BACKUP) return;
        
        const now = Date.now();
        const lastBackupTime = this.lastBackup ? parseInt(this.lastBackup) : 0;
        
        // Verificar se é hora de fazer backup
        if (now - lastBackupTime < SECURITY_CONFIG.BACKUP.BACKUP_INTERVAL) {
            return;
        }
        
        try {
            // Coletar dados para backup
            const backupData = {
                timestamp: new Date().toISOString(),
                products: JSON.parse(localStorage.getItem('lux_produtos') || '[]'),
                cart: JSON.parse(localStorage.getItem('lux_carrinho') || '[]'),
                notifications: JSON.parse(localStorage.getItem('lux_notifications') || '[]'),
                auditLogs: auditLogger.getLogs(100)
            };
            
            // Criar backup
            const backupKey = `backup_${new Date().toISOString().split('T')[0]}_${this.backupCount}`;
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // Atualizar contadores
            this.lastBackup = now.toString();
            this.backupCount++;
            
            localStorage.setItem('last_backup', this.lastBackup);
            localStorage.setItem('backup_count', this.backupCount.toString());
            
            // Limitar número de backups
            this.cleanupOldBackups();
            
            // Log da ação
            auditLogger.log('BACKUP_CREATED', 'system', {
                backupKey,
                itemCount: backupData.products.length
            });
            
            console.log(`Backup criado: ${backupKey} (${backupData.products.length} produtos)`);
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            auditLogger.log('BACKUP_FAILED', 'system', { error: error.message });
        }
    }
    
    /**
     * Limpa backups antigos
     */
    cleanupOldBackups() {
        const maxBackups = SECURITY_CONFIG.BACKUP.MAX_BACKUPS;
        
        // Obter todas as chaves de backup
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('backup_')) {
                backupKeys.push(key);
            }
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        backupKeys.sort((a, b) => b.localeCompare(a));
        
        // Remover backups extras
        while (backupKeys.length > maxBackups) {
            const oldKey = backupKeys.pop();
            localStorage.removeItem(oldKey);
            
            auditLogger.log('BACKUP_DELETED', 'system', { backupKey: oldKey });
        }
    }
    
    /**
     * Restaura um backup
     * @param {string} backupKey - Chave do backup
     * @returns {boolean} True se bem-sucedido
     */
    restoreBackup(backupKey) {
        try {
            const backupData = JSON.parse(localStorage.getItem(backupKey));
            
            if (!backupData) {
                throw new Error('Backup não encontrado');
            }
            
            // Restaurar dados
            localStorage.setItem('lux_produtos', JSON.stringify(backupData.products));
            localStorage.setItem('lux_carrinho', JSON.stringify(backupData.cart));
            localStorage.setItem('lux_notifications', JSON.stringify(backupData.notifications));
            
            // Log da ação
            auditLogger.log('BACKUP_RESTORED', 'admin', {
                backupKey,
                itemCount: backupData.products.length,
                timestamp: backupData.timestamp
            });
            
            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            auditLogger.log('BACKUP_RESTORE_FAILED', 'admin', { 
                backupKey, 
                error: error.message 
            });
            
            return false;
        }
    }
    
    /**
     * Lista backups disponíveis
     * @returns {Array} Lista de backups
     */
    listBackups() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('backup_')) {
                try {
                    const backupData = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        key,
                        timestamp: backupData.timestamp,
                        productCount: backupData.products.length,
                        size: JSON.stringify(backupData).length
                    });
                } catch (error) {
                    console.warn(`Backup inválido: ${key}`, error);
                }
            }
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        
        return backups;
    }
}

// Instância global do backup
const autoBackup = new AutoBackup();

// Iniciar backup automático
setInterval(() => autoBackup.createBackup(), SECURITY_CONFIG.BACKUP.BACKUP_INTERVAL);

// ===== EXPORTAÇÕES =====

// Exportar para uso global
window.SecurityConfig = SECURITY_CONFIG;
window.SecurityUtils = {
    generateCSRFToken,
    validateCSRFToken,
    sanitizeInput,
    validateImageURL,
    validatePasswordComplexity,
    rateLimiter,
    auditLogger,
    autoBackup
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Criar backup inicial se necessário
    setTimeout(() => autoBackup.createBackup(), 5000);
    
    // Limpar logs antigos
    auditLogger.clearOldLogs();
    
    console.log('Sistema de segurança inicializado');
});