# SITE MÍSTICO ENCANTO - ARQUIVOS ESSENCIAIS

## 📋 ARQUIVOS NECESSÁRIOS PARA O SITE FUNCIONAR

### Arquivos Principais (10 arquivos)
1. **`index.html`** - Página principal do site
2. **`style.css`** - Estilos e design do site
3. **`script.js`** - Funcionalidades JavaScript (carrinho, filtros, etc.)
4. **`admin.js`** - Painel administrativo para gerenciar produtos
5. **`security-config.js`** - Configurações de segurança avançada
6. **`config.js`** - Configurações gerais do site
7. **`.htaccess`** - Configurações do servidor Apache
8. **`error.html`** - Página de erro personalizada
9. **`robots.txt`** - Instruções para motores de busca
10. **`sw.js`** - Service Worker para cache e offline

## 🚀 COMO USAR O SITE

### 1. Configuração Básica
- Edite `config.js` para personalizar informações do site
- Modifique `admin.js` para alterar a senha do painel administrativo
- Ajuste `.htaccess` conforme necessário para seu servidor

### 2. Funcionalidades do Site
- **Catálogo de Produtos**: Filtros por cor, tamanho, tecido, estilo, preço
- **Carrinho de Compras**: Adição/remoção de produtos
- **Checkout via WhatsApp**: Finalização direta no WhatsApp
- **Painel Administrativo**: Gerenciamento completo de produtos
- **Responsividade**: Design adaptado para todos os dispositivos

### 3. Segurança Implementada
- HTTPS obrigatório
- Proteção contra XSS, CSRF, Clickjacking
- Rate limiting para login
- Backup automático de dados
- Logs de auditoria

## ⚙️ CONFIGURAÇÃO PARA DEPLOY

### Requisitos do Servidor
- Servidor Apache com mod_rewrite habilitado
- Certificado SSL válido (HTTPS obrigatório)
- Suporte a JavaScript moderno

### Passos para Deploy
1. Upload de todos os 10 arquivos para o servidor
2. Configurar certificado SSL
3. Testar HTTPS e redirecionamento
4. Testar todas as funcionalidades

## 🔧 MANUTENÇÃO

### Backup
- Sistema faz backup automático a cada 24h
- Backups armazenados no localStorage do navegador
- Restauração via painel administrativo

### Logs
- Logs de auditoria no localStorage
- Retenção de 90 dias
- Acessíveis via console do navegador

## 📞 SUPORTE

### Problemas Comuns
1. **HTTPS não funciona**: Verificar certificado SSL
2. **Painel admin não acessa**: Verificar senha em admin.js
3. **Carrinho não salva**: Verificar localStorage habilitado
4. **Imagens não carregam**: Verificar URLs HTTPS válidas

### Solução de Problemas
- Verificar console do navegador (F12)
- Verificar Network tab para requisições falhando
- Verificar localStorage para dados salvos

---

**Arquivos Mantidos**: 10 arquivos essenciais  
**Status**: ✅ PRONTO PARA PRODUÇÃO  
**Última Atualização**: 3 de Maio de 2026