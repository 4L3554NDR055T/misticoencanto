# Guia de Deploy — Místico Encanto

Este guia leva você do zero até o site publicado na internet.
Tempo estimado: **30 a 45 minutos**.

---

## O que você vai precisar criar (tudo gratuito)

| Serviço | Para que serve |
|---|---|
| [github.com](https://github.com) | Guardar o código do site |
| [mongodb.com/atlas](https://www.mongodb.com/atlas) | Banco de dados dos produtos |
| [render.com](https://render.com) | Hospedar o servidor |
| [uptimerobot.com](https://uptimerobot.com) | Manter o servidor sempre ligado |

---

## PARTE 1 — GitHub (subir o código)

### 1.1 Criar conta no GitHub

1. Acesse **github.com**
2. Clique em **Sign up** (canto superior direito)
3. Preencha:
   - **Username:** qualquer nome (ex: `misticoencanto`)
   - **Email:** seu e-mail
   - **Password:** uma senha forte
4. Resolva o captcha e clique em **Create account**
5. Verifique seu e-mail e confirme a conta

---

### 1.2 Criar o repositório

1. Após fazer login, clique no **+** no canto superior direito
2. Clique em **New repository**
3. Preencha:
   - **Repository name:** `mistico-encanto`
   - **Description:** Loja Místico Encanto (opcional)
   - Marque **Private** (o código fica só com você)
4. **NÃO marque** nenhuma das opções de "Initialize this repository"
5. Clique em **Create repository**

---

### 1.3 Fazer upload dos arquivos

1. Na página do repositório recém-criado, clique em **uploading an existing file**
   (ou no link "upload files" que aparece na tela vazia)

2. Abra o **Explorador de Arquivos** do seu computador
3. Navegue até a pasta do seu projeto
4. **Selecione todos os arquivos** da pasta `siteSther` **exceto**:
   - A pasta `node_modules` (não envie essa, é muito grande)
   - O arquivo `.env` (se existir)
   
   > Dica: selecione tudo com `Ctrl+A`, depois segure `Ctrl` e clique em `node_modules` e `.env` para desmarcar

5. **Arraste** os arquivos selecionados para a área do GitHub no navegador
   (a área que diz "Drag files here to add them to your repository")

6. Aguarde o upload de todos os arquivos (pode levar 1-2 minutos)

7. Na parte inferior da página, em **Commit changes**:
   - No campo de texto escreva: `deploy inicial`
   - Clique em **Commit changes**

8. ✅ Seu código está no GitHub!

---

## PARTE 2 — MongoDB Atlas (banco de dados)

O MongoDB Atlas é onde os produtos ficam salvos. É gratuito para sempre no plano M0 (512 MB de espaço — mais do que suficiente para uma loja).

---

### 2.1 Criar conta no MongoDB Atlas

1. Abra o navegador e acesse: **cloud.mongodb.com**

2. Clique no botão **"Try Free"** (canto superior direito da página)

3. Na tela de cadastro, você tem duas opções:
   - **Opção A — Entrar com Google:** clique em "Sign up with Google" e escolha sua conta. É a forma mais rápida.
   - **Opção B — Criar conta normal:** preencha nome, e-mail e senha, depois clique em "Create your Atlas account"

4. Se criou conta normal, vai chegar um e-mail de confirmação. Abra o e-mail e clique em **"Verify Email"**

5. Após confirmar, faça login em **cloud.mongodb.com**

---

### 2.2 Preencher o questionário inicial

Na primeira vez que entrar, o Atlas mostra um formulário de boas-vindas:

1. **"What is your goal today?"** → selecione **"Learn MongoDB"** ou **"Build a new application"** (qualquer um serve)
2. **"What type of application are you building?"** → selecione **"Web Application"**
3. **"What is your preferred language?"** → selecione **"JavaScript/Node.js"**
4. Clique em **"Finish"**

> Se esses campos não aparecerem, tudo bem — vá direto para o passo 2.3.

---

### 2.3 Criar o cluster gratuito

Após o questionário, você cai na tela de criação de cluster:

1. Você verá três opções de plano. Certifique-se de selecionar a **primeira opção gratuita**:
   - Procure a que diz **"M0"** ou **"Free"** e tem escrito **"Free forever"** embaixo
   - ⚠️ As outras opções são pagas — não clique nelas

2. Ainda nessa mesma tela, configure:
   - **Cloud Provider:** deixe **AWS** selecionado (já vem marcado)
   - **Region:** escolha qualquer região. Se quiser mais velocidade para usuários do Brasil, procure **"São Paulo"** na lista. Se não tiver, **"US East (N. Virginia)"** funciona bem
   - **Cluster Name:** apague o que tiver e escreva `mistico-encanto` (ou deixe como "Cluster0")

3. Clique no botão **"Create Deployment"** (ou "Create Cluster")

4. Uma janela ou tela de segurança abre automaticamente — **não feche**, vá para o passo 2.4

---

### 2.4 Criar o usuário do banco (tela "Security Quickstart")

Logo após criar o cluster, o Atlas abre automaticamente a tela **"Security Quickstart"**. Ela tem duas seções:

#### Seção 1 — Criar usuário

1. A opção **"Username and Password"** já vem selecionada — deixe assim
2. No campo **"Username"**, escreva: `mistico`
3. No campo **"Password"**, clique em **"Autogenerate Secure Password"**
   - Uma senha aleatória aparece no campo
   - **MUITO IMPORTANTE:** clique no ícone de copiar ao lado da senha e cole em algum lugar seguro (bloco de notas, papel, etc.) — você vai precisar dela depois e não consegue recuperar
4. Clique em **"Create User"**
   - O botão vai ficar cinza e aparecer ✓ confirmando que o usuário foi criado

#### Seção 2 — Liberar conexão

Role a página para baixo até a seção **"Where would you like to connect from?"**:

1. Clique em **"Add My Current IP Address"**
   - Isso adiciona o IP do seu computador (serve para testar localmente)

2. Agora precisa liberar o IP do Render também. Clique em **"Add IP Address"**:
   - Uma janelinha abre com um campo de texto
   - **Apague** o que estiver no campo e escreva exatamente: `0.0.0.0/0`
   - No campo **"Description"**, escreva: `Render`
   - Clique em **"Add Entry"**
   - Isso libera conexão de qualquer lugar — necessário porque o Render não tem IP fixo no plano gratuito

3. Clique em **"Finish and Close"**

4. Uma tela de parabéns aparece — clique em **"Go to Overview"**

---

### 2.5 Aguardar o cluster ficar pronto

Na tela Overview (visão geral):

- Você vai ver seu cluster `mistico-encanto` com um indicador de status
- Se estiver escrito **"Creating"** com uma bolinha animada, aguarde 1 a 3 minutos
- Quando ficar **"Active"** (bolinha verde) significa que está pronto

---

### 2.6 Copiar a string de conexão

Esta é a parte mais importante — é o "endereço + senha" que o servidor usa para acessar o banco:

1. Na tela Overview, localize seu cluster e clique no botão **"Connect"**
   - Se não aparecer esse botão, clique nos três pontinhos `...` ao lado do cluster e depois em **"Connect"**

2. Uma janela abre com várias opções. Clique em **"Drivers"**
   - (Pode aparecer como "Connect your application" em versões mais antigas)

3. Na tela seguinte:
   - **Driver:** selecione **Node.js**
   - **Version:** selecione **5.5 or later** (ou a versão mais recente da lista)

4. Logo abaixo aparece uma caixa com a string de conexão. Ela tem esse formato:
   ```
   mongodb+srv://mistico:<password>@mistico-encanto.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=mistico-encanto
   ```

5. Clique no ícone de **copiar** ao lado da string

6. Cole em um bloco de notas e **substitua `<password>`** pela senha que você salvou no passo 2.4
   - Exemplo: se sua senha for `aB3xK9mP`, a string fica:
   ```
   mongodb+srv://mistico:aB3xK9mP@mistico-encanto.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=mistico-encanto
   ```

7. **Guarde essa string completa** — você vai colar ela no Render na Parte 3

8. Feche a janela clicando em **"Close"** ou **X**

---

### ✅ Resumo do que você precisa guardar após a Parte 2

Anote em algum lugar seguro:
- A **senha do usuário** do banco (criada no passo 2.4)
- A **string de conexão completa** com a senha já substituída (criada no passo 2.6)

---

## PARTE 3 — Render.com (hospedar o servidor)

### 3.1 Criar conta

1. Acesse **render.com**
2. Clique em **Get Started for Free**
3. Recomendo entrar com **GitHub** (clique em "GitHub") — isso conecta as duas contas automaticamente
4. Autorize o Render a acessar seu GitHub

---

### 3.2 Criar o Web Service

1. No painel do Render, clique em **New +** (canto superior direito)
2. Clique em **Web Service**
3. Em **"Connect a repository"**, você vai ver seu repositório `mistico-encanto`
   - Clique em **Connect** ao lado dele
   
   > Se não aparecer, clique em "Configure account" e autorize o repositório

---

### 3.3 Configurar o serviço

Na tela de configuração, preencha:

| Campo | O que colocar |
|---|---|
| **Name** | `mistico-encanto` |
| **Region** | Oregon (US West) ou qualquer um |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

---

### 3.4 Configurar as variáveis de ambiente

Ainda na mesma tela, role para baixo até **"Environment Variables"** e adicione uma por uma clicando em **Add Environment Variable**:

**Variável 1:**
- Key: `MONGO_URI`
- Value: *(cole a string de conexão do MongoDB que você copiou no passo 2.5)*

**Variável 2:**
- Key: `ADMIN_PASSWORD`
- Value: *(crie uma senha para acessar o painel admin, ex: `MinhaLoja@2025`)*
  > Anote essa senha — você vai usar para entrar no painel admin do site

**Variável 3:**
- Key: `HASH_SALT`
- Value: *(escreva qualquer texto aleatório, ex: `sther_loja_k7x2025`)*

**Variável 4:**
- Key: `NODE_ENV`
- Value: `production`

---

### 3.5 Fazer o deploy

1. Clique em **Deploy Web Service** (botão no final da página)
2. O Render vai mostrar os logs do deploy em tempo real
3. Aguarde aparecer a mensagem:
   ```
   ✓ MongoDB conectado
   ✦ Místico Encanto → http://localhost:...
   ```
4. No topo da página aparece sua URL pública, algo como:
   ```
   https://mistico-encanto.onrender.com
   ```
   
5. ✅ **Seu site está no ar!**

> Se aparecer algum erro em vermelho nos logs, me mostre aqui que eu ajudo a resolver.

---

## PARTE 4 — UptimeRobot (manter o servidor acordado)

O plano gratuito do Render "dorme" depois de 15 minutos sem ninguém acessar.
O UptimeRobot faz uma visita automática a cada 10 minutos para evitar isso.

### 4.1 Criar conta

1. Acesse **uptimerobot.com**
2. Clique em **Register for FREE**
3. Preencha nome, e-mail e senha
4. Confirme o e-mail

---

### 4.2 Criar o monitor

1. No painel, clique em **Add New Monitor**
2. Preencha:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Místico Encanto`
   - **URL:** `https://mistico-encanto.onrender.com/health`
     *(substitua pelo endereço real que o Render te deu)*
   - **Monitoring Interval:** `10 minutes`
3. Clique em **Create Monitor**

4. ✅ O servidor agora fica acordado 24/7!

---

## PARTE 5 — Acessar o painel admin

1. Abra seu site: `https://mistico-encanto.onrender.com`
2. Role até o **rodapé** da página
3. Clique em **⚙ Painel Admin**
4. Digite a senha que você colocou em `ADMIN_PASSWORD`
5. Clique em **Acessar Painel**
6. Cadastre seus produtos — eles aparecem para todos os visitantes em tempo real!

---

## Atualizar o site no futuro

Sempre que precisar mudar algo no código:

1. Faça as alterações nos arquivos localmente
2. Vá no GitHub, entre no repositório
3. Clique no arquivo que quer alterar → clique no **lápis** (editar)
4. Faça a mudança e clique em **Commit changes**
5. O Render detecta automaticamente e faz o deploy em ~2 minutos

---

## Resumo das URLs importantes

| O quê | URL |
|---|---|
| Seu site | `https://mistico-encanto.onrender.com` |
| Health check | `https://mistico-encanto.onrender.com/health` |
| API de produtos | `https://mistico-encanto.onrender.com/api/produtos` |
| Painel do Render | `dashboard.render.com` |
| Painel do MongoDB | `cloud.mongodb.com` |

---

## Problemas comuns

**"Application failed to respond"**
→ O servidor está dormindo. Aguarde 30-60 segundos e atualize a página. Depois configure o UptimeRobot.

**"Senha incorreta" no painel admin**
→ Verifique se a variável `ADMIN_PASSWORD` está correta no painel do Render em Environment → Environment Variables.

**Site abre mas sem produtos**
→ Normal! O banco começa vazio. Entre no painel admin e cadastre os produtos.

**Erro nos logs do Render: "MONGO_URI não definida"**
→ A variável `MONGO_URI` não foi adicionada. Vá em Environment → Add Environment Variable no painel do Render.
