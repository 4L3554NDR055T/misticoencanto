# 🌐 COMO HOSPEDAR O siteSther - GUIA PRÁTICO

**Tempo total:** 45 minutos  
**Custo:** Grátis (Render oferece tier gratuito)  
**Dificuldade:** Fácil (clique em botões)

---

## 📋 ANTES DE COMEÇAR - Preparação (10 min)

### **Passo 0: Ter Essas Informações Prontas**

Você vai precisar de:
- [ ] Número do WhatsApp (ex: 5511999998888)
- [ ] Email para criar conta Render
- [ ] Email para criar conta MongoDB Atlas (pode ser o mesmo)

**Já tem tudo?** Vamos começar! ⬇️

---

## 🚀 OPÇÃO 1: RENDER (Recomendado - Mais Fácil)

### **Passo 1: Criar Repositório GitHub**

1. Vá para: https://github.com
2. Faça login (ou crie conta se não tiver)
3. Clique em **+** > **New repository**
4. Preencha:
   - **Repository name:** `mistico-encanto`
   - **Description:** Loja Místico Encanto (opcional)
   - **Public** (deixe público)
   - **Add .gitignore:** Node
   - **License:** MIT (opcional)
5. Clique **Create repository**

### **Passo 2: Fazer Upload dos Arquivos para GitHub**

**OPÇÃO A: Usar GitHub Desktop (Mais Fácil)**

1. Download: https://desktop.github.com
2. Instale e abra
3. **File** > **Clone repository**
4. Selecione seu repositório
5. Escolha pasta local: `c:\Users\aless\OneDrive\Desktop\site aleatorio\siteSther`
6. Clique **Clone**
7. Copie todos os arquivos do siteSther para a pasta clonada
8. Volte ao GitHub Desktop
9. Você verá todos os arquivos listados
10. **Commit to main:**
    - Title: `Deploy inicial siteSther`
    - Description: `Versão 1.1.0 - Pronto para produção`
11. Clique **Commit to main**
12. Clique **Publish branch**

**OPÇÃO B: Usar Linha de Comando**

```bash
# 1. Ir para pasta do projeto
cd "c:\Users\aless\OneDrive\Desktop\site aleatorio\siteSther"

# 2. Inicializar git
git init
git add .
git commit -m "Deploy inicial siteSther v1.1.0"

# 3. Adicionar remote (substitua USERNAME e REPO)
git branch -M main
git remote add origin https://github.com/SEU_USERNAME/mistico-encanto.git
git push -u origin main
```

**PRONTO!** Seus arquivos estão no GitHub ✅

---

### **Passo 3: Criar Conta MongoDB Atlas**

1. Vá para: https://www.mongodb.com/cloud/atlas
2. Clique **Sign Up**
3. Preencha:
   - Email
   - Senha forte
   - Nome completo
4. Confirme email
5. Faça login

### **Passo 4: Criar Cluster MongoDB**

1. Dashboard MongoDB Atlas > **Create**
2. Selecione **M0 Sandbox** (grátis)
3. Preencha:
   - **Cluster name:** `mistico-encanto`
   - **Provider:** AWS
   - **Region:** São Paulo (sa-east-1)
4. Clique **Create Cluster**
5. Aguarde 2-5 minutos ⏳

### **Passo 5: Obter Connection String**

1. Cluster criado > Clique **Connect**
2. Selecione **Drivers** (não QShell)
3. **Language:** Node.js
4. Copie a connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### **Passo 6: Criar Usuário MongoDB**

1. No Atlas, vá para **Database Access** (lateral esquerda)
2. Clique **Add New Database User**
3. Preencha:
   - **Authentication Method:** Password
   - **Username:** `admin`
   - **Password:** `SenhaForte123!` (guarde isso!)
4. **Built-in Role:** Atlas admin
5. Clique **Add User**

### **Passo 7: Whitelist de IPs**

1. No Atlas, vá para **Network Access** (lateral)
2. Clique **Add IP Address**
3. Selecione **Allow access from anywhere** (para começar)
4. Clique **Confirm**

### **Passo 8: Obter Connection String Final**

1. Volte ao **Cluster** > **Connect** > **Drivers**
2. Copie a string e substitua:
   - `<username>` por `admin`
   - `<password>` pela senha que criou
3. Exemplo final:
   ```
   mongodb+srv://admin:SenhaForte123!@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Guarde esse texto!** 📝

---

### **Passo 9: Criar Conta Render**

1. Vá para: https://render.com
2. Clique **Sign up**
3. Escolha **GitHub** (fácil!)
4. Autorize sua conta GitHub
5. Confirme email

---

### **Passo 10: Deploy no Render**

1. Dashboard Render > **+ New**
2. Selecione **Web Service**
3. Clique em seu repositório `mistico-encanto`
4. Preencha:
   - **Name:** `mistico-encanto`
   - **Environment:** Node
   - **Region:** São Paulo (South America)
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. Scroll down > **Environment**
6. Clique **Add Environment Variable**
7. Adicione **CADA UMA** dessas (clique + para cada):

```
PORT                  3001
MONGO_URI             mongodb+srv://admin:SenhaForte123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
ADMIN_PASSWORD        SenhaForte123Forte
HASH_SALT             8f4e2c9a7b1d5e3a6f2c8e1b4a9d7c2f
ALLOWED_ORIGINS       *
SESSION_HOURS         8
RATE_LIMIT_MAX        10
RATE_LIMIT_MINUTES    15
```

8. Clique **Create Web Service**
9. Aguarde deploy (3-5 minutos) ⏳

---

### **Passo 11: Configurar WhatsApp**

**Antes que o site fique pronto, configure o WhatsApp:**

1. No GitHub, abra o arquivo `config.js`
2. Procure a linha:
   ```javascript
   WHATSAPP: 'SEU_NUMERO_AQUI',
   ```
3. Substitua por seu número:
   ```javascript
   WHATSAPP: '5511999998888',
   ```
4. Clique **Commit changes** > **Commit to main**
5. Volte ao Render > Seu app > **Manual Deploy** > **Deploy latest commit**
6. Aguarde 2 minutos

---

### **Passo 12: Pronto! Acesse Seu Site**

1. No Render, você verá um link como:
   ```
   https://mistico-encanto.onrender.com
   ```
2. Clique nele! 🎉

**Seu site está online!**

---

## ✅ Teste Seu Site Online

### **No Navegador:**

1. Acesse: https://seu-dominio.onrender.com
2. Teste:
   - [ ] Página carrega
   - [ ] Carrinho funciona
   - [ ] Busca funciona
   - [ ] WhatsApp funciona (canto inferior direito)
   - [ ] Painel admin (rodapé > "Painel Admin")
   - [ ] Login com senha: `SenhaForte123Forte!`
   - [ ] Adicionar produto

---

## 💰 Domínio Customizado (Opcional - +$5/mês)

Se quiser um domínio próprio (ex: misticoencanto.com):

1. Compre em: GoDaddy, NameCheap, etc
2. No Render, vá para **Settings** > **Custom Domains**
3. Adicione seu domínio
4. Render fornecerá DNS para apontar

---

## 🆘 Problemas Comuns

### **"Erro: Conexão com MongoDB recusada"**

**Solução:**
1. Verifique MONGO_URI (variável de ambiente)
2. Certifique-se de que IP está whitelistado em MongoDB Atlas
3. Teste localmente: `npm start`

### **"WhatsApp não funciona"**

**Solução:**
1. Verificar número em `config.js`
2. Formato correto: `5511999998888` (sem símbolos)
3. Hard refresh: Ctrl+Shift+Del (limpar cache)

### **"Painel admin não carrega"**

**Solução:**
1. Verificar console (F12)
2. Testar com senha correta
3. Verificar se ADMIN_PASSWORD foi configurada

### **"Site muito lento"**

**Solução:**
1. Render pode dormir (restart automático)
2. Configure UptimeRobot para manter ativo (veja abaixo)
3. Considere upgrade para plano pago

---

## 🔄 Manter Site Ativo (Importante!)

Render coloca serviços gratuitos em "sleep" após 15 min de inatividade. Para evitar:

1. Vá para: https://uptimerobot.com
2. Faça login
3. **+ Add Monitor**
4. **URL:** `https://seu-dominio.onrender.com/health`
5. **Check interval:** 5 minutos
6. Clique **Create Monitor**

**Pronto!** Site ficará ativo sempre ✅

---

## 🔐 Alterar Senha Admin DEPOIS

Após publicar, altere a senha para algo único:

1. Acesse painel admin
2. Procure opção "Alterar Senha" ou similar
3. Digite senha atual + nova senha
4. Também altere em Render > Environment > ADMIN_PASSWORD

---

## 📊 Checklist Final de Deploy

- [ ] GitHub repositório criado
- [ ] Arquivos do siteSther foram para GitHub
- [ ] MongoDB cluster criado em Atlas
- [ ] Connection string obtida e testada
- [ ] Conta Render criada
- [ ] App deployado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] WhatsApp configurado em config.js
- [ ] Site online funcionando
- [ ] Carrinho funciona
- [ ] Painel admin funciona
- [ ] UptimeRobot configurado

---

## 📱 Testar em Mobile

1. Abra seu site em celular
2. Teste responsividade
3. Clique em WhatsApp
4. Deve abrir conversa no WhatsApp

---

## 🎓 Resumo Rápido

| Tarefa | Tempo | Link |
|--------|-------|------|
| GitHub | 5 min | https://github.com |
| MongoDB | 10 min | https://mongodb.com/cloud/atlas |
| Render | 20 min | https://render.com |
| Teste | 5 min | seu-dominio.onrender.com |
| **TOTAL** | **40 min** | ✅ PRONTO! |

---

## 🚀 Alternativas (Se Quiser Mudar)

### **Vercel** (Para NextJS - mais simples mas menos customizável)
- https://vercel.com
- Ideal se considerar migrar para NextJS

### **Heroku** (Pago, mas confiável)
- https://heroku.com
- $5-7/mês

### **Seu Servidor** (VPS - mais controle)
- DigitalOcean, Linode, Vultr
- $5-10/mês

---

## 💡 Dicas Extras

1. **Backup MongoDB:** Configure em Atlas (Settings > Backups)
2. **Logs:** Render > Logs (monitore erros)
3. **Analytics:** Google Analytics (adicione em config.js)
4. **Email:** Nodemailer (para confirmações de pedido)
5. **Pagamento:** Stripe ou MercadoPago (integração futura)

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas:
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com
- GitHub: https://docs.github.com

---

**Parabéns! Seu siteSther está online! 🎉**

Versão: 1.1.0  
Última atualização: 11/06/2026
