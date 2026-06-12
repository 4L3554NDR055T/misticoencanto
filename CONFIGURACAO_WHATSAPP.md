# 📱 Configuração do WhatsApp - siteSther

## 🎯 O Que Fazer

O siteSther possui botões de WhatsApp integrados, mas **não está configurado** com número real. Sem isso, os links não funcionarão.

---

## 🔧 PASSO A PASSO

### **1. Obtenha o Número do WhatsApp**

Você precisa de um número de telefone que tenha WhatsApp ativo.

**Formato requerido:** Internacional sem símbolos
- ✅ Correto: `5511999998888` (Brasil, São Paulo)
- ✅ Correto: `5535987654321` (Brasil, Minas Gerais)
- ❌ Errado: `+55 11 99999-8888` (tem símbolos)
- ❌ Errado: `11999998888` (falta código do país)

**Tabela de códigos de país:**
```
Brasil:        55
Portugal:      351
Angola:        244
Moçambique:    258
Estados Unidos: 1
México:        52
Argentina:     54
Espanha:       34
```

**Exemplo Brasil:**
```
Número local: (11) 99999-8888
Código país:  55
Formato final: 5511999998888
               │││└─ DDD (11)
               ││└── Número (99999-8888)
               │└─── Código país (55)
               └──── Sem símbolos
```

---

### **2. Abra o Arquivo de Configuração**

Arquivo: `config.js`  
Procure pela linha:

```javascript
CONTACT: {
  WHATSAPP:  'SEU_NUMERO_AQUI',          // ← AQUI
  INSTAGRAM: 'https://instagram.com/misticoencanto',
  ...
}
```

---

### **3. Substitua o Número**

**ANTES:**
```javascript
WHATSAPP:  'SEU_NUMERO_AQUI',
```

**DEPOIS:**
```javascript
WHATSAPP:  '5511999998888',  // seu número aqui
```

---

### **4. Verifique Automaticamente**

Abra o console do navegador (F12) e execute:

```javascript
console.log('WhatsApp Configurado?', ConfigHelper.isWhatsAppConfigured());
console.log('URL:', ConfigHelper.getWhatsAppURL());
```

**Resultado esperado:**
```
WhatsApp Configurado? true
URL: https://wa.me/5511999998888?text=Olá%2C%20gostaria%20de%20informações...
```

---

## 📍 Onde o WhatsApp É Usado

### 1. **Botão no Carrinho** (Finalizar compra)
```
Carrinho → [WhatsApp icon] Finalizar no WhatsApp
```

### 2. **Rodapé (Footer)**
```
Redes Sociais → WhatsApp icon
```

### 3. **Link Global**
```html
<a href="https://wa.me/5511999998888?text=...">
  WhatsApp
</a>
```

---

## 🧪 Teste Após Configurar

1. **Salve o arquivo** `config.js`
2. **Abra o site** http://localhost:3001 (ou seu domínio)
3. **Clique no botão WhatsApp** no carrinho
4. **Verifique:**
   - [ ] Abre WhatsApp
   - [ ] Abre conversa com o número correto
   - [ ] Mensagem pré-preenchida aparece

---

## ✅ Checklist Final

- [ ] Número obtido (com código de país)
- [ ] `config.js` editado
- [ ] Sem símbolos extras (sem +, espaços, traços)
- [ ] Número com 10-15 dígitos
- [ ] Testado no site
- [ ] WhatsApp abre corretamente

---

## 🆘 Problemas Comuns

### **"O link do WhatsApp não funciona"**
- Verifique se o número está no formato correto
- Teste em: https://wa.me/5511999998888 (com seu número)

### **"Apareça 'SEU_NUMERO_AQUI' na tela"**
- O número não foi configurado
- Verifique se `.env` tem WHATSAPP=seu_numero_aqui
- Ou configure diretamente em `config.js`

### **"Mensagem pré-preenchida não aparece"**
- Verificar se há espaços ou caracteres especiais no número
- Limpar cache do navegador (Ctrl+Shift+Del)

### **"Redireciona para web.whatsapp.com em vez de app"**
- Normal em desktop
- Em mobile, abre o app automaticamente

---

## 💡 Dica Extra: Mensagem Padrão Customizada

Para mudar a mensagem padrão que aparece no WhatsApp, edite:

**Arquivo:** `config.js`  
**Função:** `ConfigHelper.getWhatsAppURL()`

```javascript
// PADRÃO (Atualmente):
"Olá, gostaria de informações sobre a Místico Encanto"

// CUSTOMIZADO:
"Olá, vendo seu catálogo de camisolas!"
```

---

## 📞 Suporte

Se o WhatsApp não funcionar após configurar:
1. Confirme se tem WhatsApp no número informado
2. Teste em: https://wa.me/SEU_NUMERO_AQUI
3. Verifique console do navegador (F12 > Console)

---

**Última atualização:** 11/06/2026  
**Versão:** siteSther v1.1.0
