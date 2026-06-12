# ✅ CHECKLIST FINAL — Antes de Deploy

Use este checklist para garantir que tudo está correto antes de publicar no Render.

---

## 📦 DEPENDÊNCIAS E CÓDIGO

- [ ] `npm install` executado com sucesso
- [ ] `npm audit` sem vulnerabilidades críticas (HIGH)
- [ ] `server.js` existe e está correto
- [ ] `package.json` atualizado com scripts
- [ ] Node version >= 18.0.0 (`node --version`)

---

## 🔐 SEGURANÇA

- [ ] `.env` NÃO foi commitado no Git (verificar `.gitignore`)
- [ ] `.env.example` existe com template
- [ ] `HASH_SALT` é único (gerado com crypto.randomBytes)
- [ ] `ADMIN_PASSWORD` foi alterada de padrão
- [ ] `.env` local testado com MongoDB funcional

---

## 🗄️ BANCO DE DADOS

### MongoDB Atlas

- [ ] Cluster criado em MongoDB Atlas
- [ ] Usuário criado com senha forte (16+ caracteres)
- [ ] Network Access permite "0.0.0.0/0"
- [ ] Connection String copiada corretamente
- [ ] Testado localmente e funciona

**Comando para testar:**
```bash
mongosh "mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
```

---

## 🌐 GITHUB

- [ ] Repositório criado (público ou privado)
- [ ] Código está no `main` branch
- [ ] Nenhum arquivo sensível foi commitado:
  - [ ] `.env` não commitado
  - [ ] `node_modules/` não commitado
  - [ ] `.local` files não commitados
- [ ] Último commit feito com `git push`

**Comando para verificar:**
```bash
git status  # Deve estar clean
```

---

## 🚀 RENDER

### Criação do Web Service

- [ ] Repositório GitHub conectado ao Render
- [ ] Branch selecionado: `main`
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`

### Variáveis de Ambiente

Adicione cada uma no painel do Render:

- [ ] `NODE_ENV = production`
- [ ] `PORT = 3000`
- [ ] `MONGO_URI = mongodb+srv://...` (cole exatamente)
- [ ] `ADMIN_PASSWORD = [senha forte]`
- [ ] `HASH_SALT = [valor gerado]`
- [ ] `ALLOWED_ORIGINS = *` (ou seu domínio)
- [ ] `SESSION_HOURS = 8`
- [ ] `RATE_LIMIT_MAX = 10`
- [ ] `RATE_LIMIT_MINUTES = 15`

---

## 🧪 TESTES LOCAIS (Antes de Fazer Push)

Execute localmente e verifique:

```bash
npm run dev
```

### Testes Front-end
- [ ] Site abre: `http://localhost:3001`
- [ ] Sem erros no console (F12)
- [ ] Botão de busca funciona
- [ ] Filtros funcionam
- [ ] Carrinho funciona
- [ ] Botões WhatsApp não mostram erro

### Testes Admin
- [ ] Painel admin abre: `/admin.html`
- [ ] Login funciona com senha correta
- [ ] Pode adicionar produto
- [ ] Pode editar produto
- [ ] Pode remover produto
- [ ] Importar/exportar funciona

### Testes API
```bash
# Verificar conectividade
curl http://localhost:3001/health

# Listar produtos
curl http://localhost:3001/api/produtos

# Testar login (substitua SENHA)
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"senha":"SENHA"}'
```

---

## 📝 DOCUMENTAÇÃO

- [ ] `README.md` atualizado
- [ ] `RENDER_SETUP.md` criado (guia passo-a-passo)
- [ ] `START_LOCAL.md` criado (testes locais)
- [ ] `render.yaml` criado (IaC)

---

## 🎯 DEPLOY FINAL

1. [ ] Tudo acima está ✅
2. [ ] Último `git push` feito
3. [ ] Variáveis adicionadas no Render
4. [ ] Deploy iniciado no Render
5. [ ] Aguardar "Live" (aparecerá em verde)

---

## ✅ PÓS-DEPLOY (Após ir para o ar)

- [ ] Site carrega: `https://seu-app.onrender.com`
- [ ] Health check funciona: `/health`
- [ ] API retorna produtos: `/api/produtos`
- [ ] Admin acessível: `/admin.html`
- [ ] Admin login funciona
- [ ] Pode adicionar/editar/remover produtos
- [ ] WhatsApp links funcionam

---

## 🔍 VERIFICAÇÃO DE LOGS

Se algo falhar após deploy:

1. Abra Render → Dashboard
2. Clique em "View Logs"
3. Procure por error messages

**Erros comuns:**

| Erro | Solução |
|------|---------|
| `Cannot connect to MongoDB` | Verificar MONGO_URI no Render |
| `MONGO_URI not defined` | Adicionar variável ambiente |
| `Application crashed` | Ver logs completos |
| `TypeError: db is undefined` | Aguardar 30s e recarregar |

---

## 📞 SUPORTE

Se estiver preso:

1. Veja `RENDER_SETUP.md` section "Troubleshooting"
2. Verifique logs no Render
3. Compare ambiente Render com `.env.local` local

---

## 🎉 SUCESSO!

Quando tudo funcionar:

- [ ] Site está ao vivo
- [ ] Todos os testes passam
- [ ] Nenhum erro nos logs
- [ ] Admin funciona perfeitamente
- [ ] Cliente pode acessar a loja

**Parabéns!** 🚀 Seu projeto está deployado com sucesso!

---

## 📌 PRÓXIMOS PASSOS

1. Configurar domínio customizado (opcional)
2. Adicionar Google Analytics
3. Configurar backup automático do MongoDB
4. Monitorar uptime com UptimeRobot
5. Adicionar produtos iniciais no admin

Bom sucesso! 💜✦
