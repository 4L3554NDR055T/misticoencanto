# 🚀 DEPLOY EM 3 PASSOS PRINCIPAIS

## ⏱️ Tempo Total: 45 minutos | Custo: GRÁTIS

---

## **PASSO 1️⃣: MongoDB (10 min)**

### Criar banco de dados grátis
1. https://mongodb.com/cloud/atlas
2. Sign Up → confirmar email
3. **Create** → M0 Sandbox (grátis)
4. Region: **São Paulo** (sa-east-1)
5. **Database Access** → Add user:
   - Username: `admin`
   - Password: `SenhaForte123!`
6. **Network Access** → Allow from anywhere
7. **Connect** → Obter connection string

**Connection String final:**
```
mongodb+srv://admin:SenhaForte123!@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
✅ **Guarde esse texto!**

---

## **PASSO 2️⃣: GitHub + Upload (10 min)**

### Enviar código para nuvem
1. https://github.com → Sign Up (se não tiver)
2. **+ New Repository**
   - Name: `mistico-encanto`
   - Public: ✅
   - Add .gitignore: Node
3. **GitHub Desktop** (https://desktop.github.com)
   - Clone seu repositório
   - Copie arquivos do siteSther
   - **Commit** → "Deploy inicial"
   - **Publish branch**

✅ **Código no GitHub**

---

## **PASSO 3️⃣: Deploy no Render (15 min)**

### Publicar site online
1. https://render.com → Sign Up com GitHub
2. **+ New** → **Web Service**
3. Selecione repositório: `mistico-encanto`
4. Preencha:
   - Name: `mistico-encanto`
   - Environment: Node
   - Region: São Paulo
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Environment Variables** - Adicione CADA UMA:

| Chave | Valor |
|-------|-------|
| PORT | 3001 |
| MONGO_URI | mongodb+srv://admin:SenhaForte123!@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority |
| ADMIN_PASSWORD | SenhaForte123Forte! |
| HASH_SALT | 8f4e2c9a7b1d5e3a6f2c8e1b4a9d7c2f |
| ALLOWED_ORIGINS | * |
| SESSION_HOURS | 8 |
| RATE_LIMIT_MAX | 10 |
| RATE_LIMIT_MINUTES | 15 |

6. **Create Web Service**
7. ⏳ Aguarde 3-5 minutos
8. Você receberá um link: `https://mistico-encanto.onrender.com`

✅ **SITE ONLINE!**

---

## **EXTRA: Configurar WhatsApp (5 min)**

No GitHub, edite `config.js`:
```javascript
WHATSAPP: '5511999998888'  // seu número aqui
```

Commit → Render: Manual Deploy

---

## **CHECKLIST FINAL**

- ✅ MongoDB cluster criado
- ✅ Usuario MongoDB criado  
- ✅ Connection string obtida
- ✅ GitHub repositório criado
- ✅ Arquivos enviados GitHub
- ✅ Render account criada
- ✅ Web Service deployado
- ✅ Variáveis de ambiente configuradas
- ✅ WhatsApp configurado
- ✅ Site online em: https://seu-dominio.onrender.com

---

## **SE TIVER PROBLEMAS**

```
"Erro MongoDB"
→ Verificar MONGO_URI em Render (Environment)
→ Verificar IP whitelistado em Atlas

"WhatsApp não funciona"  
→ Número: 5511999998888 (sem símbolos)
→ Fazer hard refresh: Ctrl+Shift+Del

"Site muito lento"
→ Configure UptimeRobot para manter ativo
→ (Render dorme apps gratuitos inativo > 15 min)
```

---

## **MANTER SITE ATIVO (Importante!)**

1. https://uptimerobot.com
2. Add Monitor:
   - URL: `https://seu-dominio.onrender.com/health`
   - Check interval: 5 min
3. Done! Site fica sempre ativo ✅

---

## **DOMÍNIO CUSTOMIZADO (Opcional)**

Quer `misticoencanto.com` ao invés de `.onrender.com`?

1. Compre em: GoDaddy, NameCheap, Registro.br (~R$ 25-50/ano)
2. Render > Settings > Custom Domains
3. Adicione seu domínio
4. Configure DNS (Render instrui)
5. Pronto em 24-48h!

---

## **LINKS RÁPIDOS**

- 🌍 **MongoDB Atlas:** https://mongodb.com/cloud/atlas
- 💻 **GitHub:** https://github.com
- 🚀 **Render:** https://render.com
- ⏰ **UptimeRobot:** https://uptimerobot.com
- 📋 **Guia Completo:** `COMO_HOSPEDAR.md`

---

## **Está pronto!** 

Seu siteSther estará online em menos de 1 hora! 🎉

---

*Gerado: 11/06/2026 | Versão: siteSther 1.1.0*
