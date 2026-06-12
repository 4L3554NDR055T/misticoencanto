# 🚀 Deploy no Render — Guia Completo

Passos exatos para publicar o Místico Encanto no Render, **totalmente funcional e sem bugs**.

---

## ✅ PRÉ-REQUISITOS

- [x] Código commitado no GitHub (criar repositório privado se necessário)
- [x] Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita)
- [x] Conta no [Render.com](https://render.com) (gratuita)

---

## 📋 CHECKLIST — Antes de Fazer Deploy

**Execute cada passo:**

### 1️⃣ Verificar Node e Dependências

```bash
# Verificar versão do Node
node --version    # Deve ser >= 18.0.0

# Verificar dependências
npm list          # Não deve haver conflitos

# Corrigir vulnerabilidades (já executado)
npm audit fix --force

# Reinstalar (opcional, mas recomendado)
npm install
```

### 2️⃣ Configurar MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma nova conta (ou faça login)
3. Crie um novo projeto:
   - Nome: "mistico-encanto"
   - Clique em "Create Project"

4. **Criar um Cluster:**
   - Clique em "Build a Database"
   - Escolha "M0 Free" (totalmente gratuito)
   - Provider: **AWS**
   - Region: **us-east-1** (ou mais próximo de você)
   - Nome do cluster: `cluster0` (padrão está bom)
   - Clique em "Create Cluster" (aguarde 2-3 minutos)

5. **Criar Usuário de Banco:**
   - Na aba "Security" → "Database Access"
   - Clique "Add New Database User"
   - **Username:** `mistico_user`
   - **Password:** Gere uma senha forte com 16+ caracteres
   - Permissões: "Atlas Admin"
   - Clique "Add User"

6. **Permitir Acesso:**
   - Na aba "Network Access"
   - Clique "Add IP Address"
   - Escolha "Allow access from anywhere" (0.0.0.0/0)
   - Clique "Add IP"

7. **Obter Connection String:**
   - Clique no botão "Connect" do cluster
   - Escolha "Drivers"
   - **Node.js** (já selecionado)
   - Copie a string (será algo como):
     ```
     mongodb+srv://mistico_user:SENHA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Substitua `SENHA` pela senha que criou**
   - Salve essa string — você precisará no Render

---

## 🔐 Gerar Valores de Segurança

**Execute no seu terminal local:**

```bash
# Gerar HASH_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Resultado será algo como:
# a7f3e2c1b9d4f5a8c6e2b1d9f4a3c8e5b2d7f9a4c6e1b3d5f8a2c4e7b9d1f3
```

**Copie e guarde esses valores** — você precisará no Render.

---

## 🌐 Fazer Push para GitHub

1. **Criar repositório GitHub** (se não tiver):
   ```bash
   git init
   git add .
   git commit -m "Inicial: mistico-encanto pronto para Render"
   git remote add origin https://github.com/SEU_USER/mistico-encanto.git
   git push -u origin main
   ```

2. **Verificar que os arquivos estão:**
   - `server.js` ✓
   - `package.json` ✓
   - `.env` (NÃO! Este não deve ser commitado)
   - `.gitignore` (deve conter `.env`, `node_modules/`, etc.)

---

## 🎯 Deploy no Render — Passo a Passo

### 1. Criar Web Service

1. Vá para [Render.com](https://render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub:
   - Clique em "Connect account" (se necessário)
   - Selecione o repositório: `mistico-encanto`
   - Clique em "Connect"

### 2. Configurar Build

| Campo | Valor |
|-------|-------|
| **Name** | `mistico-encanto` |
| **Environment** | `Node` |
| **Region** | `Ohio` (ou próximo a você) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### 3. Configurar Variáveis de Ambiente

Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione cada uma (cópia e cola):

| Key | Value | Notas |
|-----|-------|-------|
| `NODE_ENV` | `production` | Obrigatório |
| `PORT` | `3000` | Render define automaticamente |
| `MONGO_URI` | `mongodb+srv://mistico_user:SENHA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority` | **Cole exatamente da sua string** |
| `ADMIN_PASSWORD` | _crie uma senha forte_ | Ex: `Encanto@Render#2025Mistico` |
| `HASH_SALT` | _resultado do comando anterior_ | Ex: `a7f3e2c1b9d4f5a8...` |
| `ALLOWED_ORIGINS` | `*` | Mude depois se tiver domínio |
| `SESSION_HOURS` | `8` | Padrão está bom |
| `RATE_LIMIT_MAX` | `10` | Proteção contra ataques |
| `RATE_LIMIT_MINUTES` | `15` | Padrão está bom |

**Certifique-se que MONGO_URI está correta!** — É a causa mais comum de falha.

### 4. Iniciar Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (5-10 minutos)
3. Quando ver **"Live"** em verde, o site está pronto!

---

## ✅ Testar Após Deploy

### 1. **Health Check**

Abra no navegador:
```
https://seu-app-name.onrender.com/health
```

Deve retornar:
```json
{"status":"ok","ts":1234567890}
```

### 2. **Listar Produtos**

```
https://seu-app-name.onrender.com/api/produtos
```

Deve retornar:
```json
{"produtos":[],"pagination":{"page":1,"limit":50,"total":0,"pages":0}}
```

Se retornar erro MongoDB, volte ao painel do Render:
- Clique em "Environment"
- Verifique MONGO_URI (copie e cole novamente se necessário)

### 3. **Acessar Painel Admin**

1. Abra: `https://seu-app-name.onrender.com/admin.html`
2. Clique em "Acessar Painel Admin"
3. Digite a senha: (a que você configurou em `ADMIN_PASSWORD`)
4. Se funcionar, está 100% pronto!

---

## 🐛 Troubleshooting — Se Algo Falhar

### **Erro: "Cannot connect to MongoDB"**

**Causa:** MONGO_URI incorreta ou conexão bloqueada.

**Solução:**
1. Verifique a string no painel MongoDB Atlas:
   - Clique em "Connect" → "Drivers"
   - Copie e cole novamente no Render
2. Verifique o IP allowlist no MongoDB:
   - "Network Access" → Certifique-se que "0.0.0.0/0" está lá
3. Tente reconectar no painel do Render

### **Erro: "Invalid MONGO_URI"**

**Cause:** String formatada errado ou senha com caracteres especiais.

**Solução:**
1. Se a senha tem `@`, `:`, etc., ela deve ser URL-encoded
2. Copie direto do MongoDB Atlas (não edite manualmente)

### **App fica em "Deploying" por muito tempo**

**Causa:** Build falhando.

**Solução:**
1. Clique em "View Logs"
2. Procure por erro de npm (dependências)
3. Tente atualizar: `npm install && npm audit fix`

### **Página branca ou 500 error**

**Causa:** Problema no servidor.

**Solução:**
1. Vá em "View Logs" no Render
2. Procure pela mensagem de erro
3. 99% das vezes é MONGO_URI ou ADMIN_PASSWORD vazio

---

## 🎉 Pronto!

Seu site está publicado em:
```
https://seu-app-name.onrender.com
```

**Dicas finais:**

- 📌 Salve a URL em algum lugar
- 🔐 Mude a senha do admin regularmente
- 📊 Monitore o painel do Render para uptime
- 💾 Faça backup do MongoDB Atlas regularmente
- ⚡ Se tiver domínio próprio, configure custom domain no Render

---

## 📞 Suporte

Se algo falhar:

1. Verifique os logs no Render: "Logs" tab
2. Procure por erro específico neste guide
3. Se persistir, abra issue no GitHub com a mensagem de erro

**Bom deployment!** 🚀
