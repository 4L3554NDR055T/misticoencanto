# 🏠 Rodar Localmente — Antes de Fazer Deploy

Siga estes passos para testar o projeto localmente antes de publicar no Render.

---

## 1️⃣ Instalar Dependências

```bash
npm install
```

---

## 2️⃣ Configurar MongoDB Local

### Opção A: Usar MongoDB Atlas (Recomendado)

1. Vá para [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster (siga o guia em `RENDER_SETUP.md`)
3. Copie a connection string
4. Crie um arquivo `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
5. Edite `.env.local` e preencha:
   ```env
   MONGO_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ADMIN_PASSWORD=SenhaLocal123!
   HASH_SALT=seu_salt_aleatorio
   ```

### Opção B: Usar MongoDB Local

1. [Baixe MongoDB Community](https://www.mongodb.com/try/download/community)
2. Instale e inicie o serviço
3. Edite `.env.local`:
   ```env
   MONGO_URI=mongodb://localhost:27017/mistico_encanto
   ADMIN_PASSWORD=SenhaLocal123!
   HASH_SALT=dev_salt
   ```

---

## 3️⃣ Rodar o Servidor

```bash
npm run dev
```

Você deve ver:
```
✓ MongoDB conectado
✓ Admin criado. Senha: SenhaLocal123!

✦ Místico Encanto está rodando
  🌐 http://localhost:3001
  📊 Painel admin em /admin.html
  🔗 API em http://localhost:3001/api/produtos
```

---

## 4️⃣ Testar Localmente

### Abra no Navegador:

1. **Site Principal:**
   ```
   http://localhost:3001
   ```

2. **Painel Admin:**
   ```
   http://localhost:3001/admin.html
   ```
   - Clique "Acessar Painel Admin"
   - Senha: `SenhaLocal123!` (ou a que você configurou)

3. **API de Produtos:**
   ```
   http://localhost:3001/api/produtos
   ```

4. **Health Check:**
   ```
   http://localhost:3001/health
   ```

---

## 5️⃣ Testar Funcionalidades

### ✅ Front-end
- [ ] Página carrega (sem erros no console)
- [ ] Busca funciona
- [ ] Filtros funcionam
- [ ] Carrinho funciona
- [ ] Botões WhatsApp funcionam

### ✅ Admin
- [ ] Login funciona
- [ ] Adicionar produto funciona
- [ ] Editar produto funciona
- [ ] Remover produto funciona
- [ ] Importar/exportar funciona

### ✅ API
- [ ] `GET /api/produtos` retorna JSON
- [ ] `POST /api/admin/login` com senha correta funciona
- [ ] `POST /api/admin/produtos` adiciona produto
- [ ] `PUT /api/admin/produtos/:id` edita
- [ ] `DELETE /api/admin/produtos/:id` remove

---

## 6️⃣ Limpar Cache (Se Necessário)

```bash
# Limpar localStorage do navegador
# 1. Abra DevTools (F12)
# 2. Application → Local Storage → http://localhost:3001
# 3. Delete all entries

# Ou via console:
# localStorage.clear()
```

---

## 🐛 Troubleshooting Local

### **Erro: "MONGO_URI não definida"**
- Certifique-se que `.env.local` existe
- Verifique que está na raiz do projeto
- Reinicie o servidor

### **Erro: "Cannot connect to MongoDB"**
- Verifique se MongoDB está rodando
- Se usar Atlas, certifique-se da string de conexão
- Tente pingar o banco: `mongosh "mongodb://..."` ou via Atlas

### **Admin não faz login**
- Verifique a senha em `.env.local`
- Limpe localStorage no navegador
- Reinicie o servidor

### **Produtos não aparecem**
- Abra `/api/produtos` no navegador
- Se retorna `{"produtos":[]...}`, está correto (sem dados ainda)
- Adicione alguns no painel admin

---

## ✅ Tudo Pronto Para Deploy?

Se tudo acima funcionou:

1. Commit seu código no GitHub:
   ```bash
   git add .
   git commit -m "Pronto para Render"
   git push
   ```

2. Siga o guia em `RENDER_SETUP.md` para fazer deploy

---

## 💡 Dicas

- **Port:** Mude em `.env.local` se 3001 já está em uso
- **Debug:** Abra DevTools (F12) para ver logs
- **Hot Reload:** Use `npm run dev` para reiniciar automaticamente
- **Limpar:** `npm install` se tiver conflitos de dependências

Bom desenvolvimento! 🚀
