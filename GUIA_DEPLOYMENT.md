# 🚀 Guia de Deployment - siteSther

**Versão:** 1.1.0  
**Data:** 11/06/2026  
**Status:** ✅ Pronto para publicar

---

## 📋 Checklist PRÉ-DEPLOYMENT

Antes de publicar, verifique:

- [x] npm audit fix foi executado (0 vulnerabilidades)
- [ ] WhatsApp configurado em `config.js`
- [ ] `.env` local testado
- [ ] MongoDB Atlas criado e testado
- [ ] Senha admin forte definida
- [ ] Botões funcionam (carrinho, login, filtros)
- [ ] Responsivo em mobile
- [ ] Cache browser testado
- [ ] Logs analisados

---

## 🌐 Opção 1: Deploy no Render (Recomendado)

**Render** é gratuito, confiável e suporta Node.js perfeitamente.

### **Passo 1: Preparar Repositório Git**

```bash
cd siteSther
git init
git add .
git commit -m "Deploy inicial siteSther v1.1.0"
```

**⚠️ Importante:** Adicione ao `.gitignore`:
```
.env
.env.local
node_modules/
npm-debug.log*
.DS_Store
```

### **Passo 2: Criar Conta Render**

1. Acesse: https://render.com
2. Faça login ou crie conta (pode usar GitHub)
3. Conecte seu repositório Git

### **Passo 3: Criar Web Service**

1. **Dashboard** > **New** > **Web Service**
2. **Selecione seu repositório**
3. Preencha:
   - **Name:** `mistico-encanto`
   - **Region:** `São Paulo` (sel-sao-paulo)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### **Passo 4: Variáveis de Ambiente**

No painel Render, vá para **Environment**:

```
PORT=3001
MONGO_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
ADMIN_PASSWORD=SuaSenhaForte123!
SESSION_HOURS=8
RATE_LIMIT_MAX=10
RATE_LIMIT_MINUTES=15
ALLOWED_ORIGINS=https://mistico-encanto.onrender.com
HASH_SALT=8f4e2c9a7b1d5e3a6f2c8e1b4a9d7c2f
```

### **Passo 5: Deploy**

1. Clique **Deploy**
2. Aguarde a build (2-5 min)
3. Acesse: `https://mistico-encanto.onrender.com`

---

## 🗄️ Passo Importante: Configurar MongoDB Atlas

### **1. Criar Conta MongoDB Atlas**
- Acesse: https://www.mongodb.com/cloud/atlas
- Faça login ou crie conta grátis
- Clique **Create a Cluster**

### **2. Criar Cluster**
- **Tier:** M0 (grátis, suficiente para começar)
- **Provider:** AWS
- **Region:** São Paulo (sa-east-1)
- **Cluster Name:** `mistico-encanto`

### **3. Obter Connection String**
1. Cluster criado → **Connect**
2. **Drivers** → **Node.js**
3. Copie a connection string:
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **4. Adicionar Credenciais**
No Atlas, vá para **Database Access**:
- **Username:** seu_usuario_aqui
- **Password:** SenhaForte123!

Depois vá para **Network Access**:
- Clique **Add IP Address**
- Selecione **Allow Access from Anywhere** (recomendado para teste)

### **5. Testar Conexão Local**
```bash
npm start
# Verificar se conecta: "✓ MongoDB conectado"
```

---

## 📱 Opção 2: Deploy em Vercel

**Vercel** é bom para frontend, mas o siteSther é um app full-stack, então Render é melhor.

Se quiser usar Vercel:
```bash
npm install -g vercel
vercel --prod
```

⚠️ **Nota:** Vercel é mais para APIs serverless. Express + MongoDB é melhor no Render.

---

## 🏠 Opção 3: Deploy Local (VPS/Servidor Próprio)

Se tem um servidor com Node.js:

```bash
# 1. SSH para seu servidor
ssh usuario@seu-servidor.com

# 2. Clone o repositório
git clone seu-repo siteSther
cd siteSther

# 3. Instale dependências
npm install --production

# 4. Configure .env
nano .env
# Adicione as variáveis

# 5. Inicie com PM2 (gerenciador de processos)
npm install -g pm2
pm2 start server.js --name "mistico-encanto"
pm2 save
```

---

## ✅ Teste Após Deploy

### **1. Health Check**
```bash
curl https://seu-dominio.com/health
# Resposta: {"status":"ok","ts":1718054400000}
```

### **2. Listar Produtos**
```bash
curl https://seu-dominio.com/api/produtos?limit=5
```

### **3. Login Admin**
```bash
curl -X POST https://seu-dominio.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"senha":"SuaSenhaForte123!"}'
# Resposta com token
```

### **4. No Navegador**
1. Acesse seu domínio
2. Clique em **Painel Admin** (rodapé)
3. Digite senha
4. Tente adicionar um produto

---

## 🔒 Após Publicar - Segurança

### **1. Alterar Senha Admin**
1. Acesse painel
2. ⚙️ (ícone de configurações, se existir)
3. Altere senha para algo **MUITO forte**

### **2. Whitelist de IPs (Opcional)**
Se desejar restringir acesso:
```javascript
// Em server.js, adicione:
const ADMIN_IPS = ['SEU_IP_AQUI'];
```

### **3. SSL/HTTPS**
- Render fornece automaticamente
- Se usar VPS: `certbot` (Let's Encrypt)

### **4. Monitorar Logs**
```bash
# Render: Dashboard > Logs
# VPS: tail -f /var/log/nodejs/mistico-encanto.log
```

---

## 📊 Performance & Monitoramento

### **Ferramentas Recomendadas**

1. **UptimeRobot** (Monitorar downtime)
   - URL: `https://seu-dominio.com/health`
   - Intervalo: 5 min
   - Alerta se cair

2. **Google Analytics** (Tráfego)
   - Adicione em `config.js`
   - `GOOGLE_ANALYTICS_ID: 'UA-XXXXX'`

3. **Lighthouse** (Performance)
   - Acesse seu site em dev tools
   - Clic "Lighthouse"
   - Objetivo: > 80 em Performance

---

## 🆘 Troubleshooting

### **"Erro: MONGO_URI não definida"**
- Variável de ambiente não foi adicionada
- Restart do serviço necessário após adicionar

### **"Conexão recusada ao MongoDB"**
- Cluster não está ativo
- IP não está whitelistado no Atlas
- Connection string incorreta

### **"Site muito lento"**
- Aumentar tamanho do cluster MongoDB (M1+)
- Adicionar cache Redis
- Otimizar imagens

### **"Admin não consegue adicionar produtos"**
- Verificar logs: `console.error` no servidor
- Validação de dados muito restritiva

---

## 📈 Próximos Passos

1. **Custom Domain**
   - Comprar domínio (GoDaddy, NameCheap, etc)
   - Apontar DNS para Render (CNAME)

2. **Email Notifications**
   - Adicionar nodemailer para confirmações

3. **Pagamento Online**
   - Integrar Stripe ou MercadoPago

4. **Analytics Avançado**
   - Dashboard com vendas por dia/semana

---

## 📞 Suporte Render

- **Docs:** https://render.com/docs
- **Status:** https://status.render.com
- **Chat:** render.com/support

---

**Pronto para publicar? Let's go! 🚀**

Versão: siteSther v1.1.0  
Data: 11/06/2026
