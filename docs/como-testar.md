# Como Testar o CorreJunto

> Guia de demonstração para a Sprint 1 — cobre tanto o **frontend** (navegador) quanto a **API** (Postman / curl).

---

## Estrutura do projeto

```
src/
  backend/      ← código Node.js (rotas, controllers, models, middlewares)
  frontend/     ← interface web (index.html, css/style.css, js/app.js)
  package.json  ← ponto de entrada: "dev": "nodemon backend/server.js"
```

---

## 1. Subindo o servidor

```bash
cd src
npm run dev
```

O servidor responde em: `http://localhost:3000`

> **Atenção:** os dados ficam em memória. Ao reiniciar o servidor, tudo é apagado.

---

## 2. Demonstração pelo Frontend (recomendado para a aula)

Abra o navegador em **`http://localhost:3000`**. Não é necessário instalar nada extra.

### Roteiro visual — passo a passo

#### Passo 1 — Cadastro
1. A tela abre na aba **Entrar**. Clique na aba **Cadastrar**.
2. Preencha nome, e-mail e senha (mínimo 6 caracteres).
3. Clique em **Criar conta**.
4. O sistema redireciona automaticamente para a lista de treinos.

> **O que mostrar:** a mensagem de boas-vindas com o nome do usuário aparece no topo da lista.

#### Passo 2 — Criar um treino
1. Clique em **+ Novo treino**.
2. Selecione o tipo: `Longão`.
3. Escolha uma data futura no calendário e um horário.
4. Preencha o local: `Parque Municipal - Portão Principal`.
5. (Opcional) Informe o pace: `6:00/km` e uma descrição.
6. Clique em **Criar treino**.
7. A lista aparece com o treino criado.

> **O que mostrar:** o card do treino exibe tipo, data, horário, local, criador e número de participantes.

#### Passo 3 — Ver detalhes
1. Clique em **Ver** no card do treino.
2. A tela de detalhe exibe todas as informações.
3. Como é o criador, o botão **Cancelar este treino** aparece.

#### Passo 4 — Criar um segundo usuário (aba anônima)
1. Abra uma **aba anônima** do navegador e acesse `http://localhost:3000`.
2. Cadastre um segundo usuário com outro e-mail.
3. Este usuário vê o treino criado pelo primeiro na lista.
4. Ao abrir o detalhe, **não aparece** o botão de cancelar — apenas o criador pode.

> **O que mostrar:** isolamento de permissões e que sessões diferentes coexistem.

#### Passo 5 — Cancelar o treino (voltar para o primeiro usuário)
1. Na aba original (primeiro usuário), abra o detalhe do treino.
2. Clique em **Cancelar este treino** → confirme.
3. Volte à lista: ela fica **vazia** — treinos cancelados não aparecem.

#### Passo 6 — Demonstrar proteção de rota
1. Abra `http://localhost:3000` em outra aba anônima **sem fazer login**.
2. A tela de login é exibida automaticamente — sem acesso à lista.
3. Ou, no DevTools (F12 → Console), execute:
   ```js
   fetch('/treinos').then(r => r.json()).then(console.log)
   ```
   Resultado: `{ erro: "Token de autenticação não fornecido." }`

---

---

## 3. Verificando se a API está no ar

```
GET http://localhost:3000/health
```

**Resposta esperada (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-07T21:00:00.000Z"
}
```

---

## 4. Autenticação (via Postman / curl)

### 4.1 Cadastro de usuário

```
POST http://localhost:3000/auth/cadastro
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Ana Lima",
  "email": "ana@teste.com",
  "senha": "123456"
}
```

**Resposta esperada (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "be6c85d8-5c43-4d56-9ac2-06e24151387d",
    "nome": "Ana Lima",
    "email": "ana@teste.com",
    "criadoEm": "2026-06-07T21:00:00.000Z"
  }
}
```

> **Copie o valor de `token`** — ele será usado em todas as requisições seguintes.

**Validações ativas:**
| Situação | Status | Mensagem |
|---|---|---|
| Campo faltando | 400 | `Os campos nome, email e senha são obrigatórios.` |
| E-mail inválido | 400 | `E-mail inválido.` |
| Senha menor que 6 caracteres | 400 | `A senha deve ter pelo menos 6 caracteres.` |
| E-mail já cadastrado | 409 | `E-mail já cadastrado.` |

---

### 4.2 Login

```
POST http://localhost:3000/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "ana@teste.com",
  "senha": "123456"
}
```

**Resposta esperada (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "be6c85d8-5c43-4d56-9ac2-06e24151387d",
    "nome": "Ana Lima",
    "email": "ana@teste.com",
    "criadoEm": "2026-06-07T21:00:00.000Z"
  }
}
```

**Validações ativas:**
| Situação | Status | Mensagem |
|---|---|---|
| Campo faltando | 400 | `E-mail e senha são obrigatórios.` |
| E-mail não cadastrado | 401 | `Credenciais inválidas.` |
| Senha incorreta | 401 | `Credenciais inválidas.` |

---

### 4.3 Verificar usuário logado

```
GET http://localhost:3000/auth/me
Authorization: Bearer <seu_token_aqui>
```

**Resposta esperada (200):**
```json
{
  "usuario": {
    "id": "be6c85d8-5c43-4d56-9ac2-06e24151387d",
    "nome": "Ana Lima",
    "email": "ana@teste.com",
    "criadoEm": "2026-06-07T21:00:00.000Z"
  }
}
```

---

## 5. Treinos (via Postman / curl)

> Todos os endpoints de treino exigem o header:
> ```
> Authorization: Bearer <seu_token_aqui>
> ```

---

### 5.1 Criar treino

```
POST http://localhost:3000/treinos
Content-Type: application/json
Authorization: Bearer <seu_token_aqui>
```

**Body (todos os campos):**
```json
{
  "data": "2026-06-15",
  "horario": "07:00",
  "local": "Parque Municipal - Portão Principal",
  "tipo": "corrida_leve",
  "descricao": "Treino de domingo para iniciantes, ritmo tranquilo.",
  "paceEsperado": "6:30/km"
}
```

**Body (somente obrigatórios):**
```json
{
  "data": "2026-06-15",
  "horario": "07:00",
  "local": "Parque Municipal",
  "tipo": "longao"
}
```

**Tipos de treino aceitos:**
| Valor | Descrição |
|---|---|
| `corrida_leve` | Corrida leve |
| `intervalado` | Treino intervalado |
| `longao` | Longão |

**Resposta esperada (201):**
```json
{
  "mensagem": "Treino criado com sucesso.",
  "treino": {
    "id": "3b4c87d3-d053-47dc-9d7e-6e633cc5f7fd",
    "data": "2026-06-15",
    "horario": "07:00",
    "local": "Parque Municipal",
    "tipo": "corrida_leve",
    "descricao": "Treino de domingo para iniciantes, ritmo tranquilo.",
    "paceEsperado": "6:30/km",
    "criadorId": "be6c85d8-5c43-4d56-9ac2-06e24151387d",
    "status": "ativo",
    "participantes": ["be6c85d8-5c43-4d56-9ac2-06e24151387d"],
    "criadoEm": "2026-06-07T21:00:00.000Z",
    "atualizadoEm": "2026-06-07T21:00:00.000Z",
    "criador": { "id": "be6c85d8-...", "nome": "Ana Lima" },
    "totalParticipantes": 1
  }
}
```

> **Copie o `id` do treino** — você vai precisar nas próximas requisições.

**Validações ativas:**
| Situação | Status | Mensagem |
|---|---|---|
| Campo obrigatório faltando | 400 | `Os campos data, horario, local e tipo são obrigatórios.` |
| Tipo inválido | 400 | `Tipo de treino inválido. Valores aceitos: corrida_leve, intervalado, longao.` |
| Formato de data errado | 400 | `Data inválida. Use o formato AAAA-MM-DD.` |
| Formato de horário errado | 400 | `Horário inválido. Use o formato HH:MM.` |
| Sem token | 401 | `Token de autenticação não fornecido.` |

---

### 5.2 Listar treinos ativos

```
GET http://localhost:3000/treinos
Authorization: Bearer <seu_token_aqui>
```

**Resposta esperada (200):**
```json
{
  "total": 1,
  "treinos": [
    {
      "id": "3b4c87d3-d053-47dc-9d7e-6e633cc5f7fd",
      "data": "2026-06-15",
      "horario": "07:00",
      "local": "Parque Municipal",
      "tipo": "corrida_leve",
      "status": "ativo",
      "criador": { "id": "...", "nome": "Ana Lima" },
      "totalParticipantes": 1
    }
  ]
}
```

> Treinos cancelados **não aparecem** nesta listagem.

---

### 5.3 Ver detalhes de um treino

Substitua `:id` pelo `id` do treino criado.

```
GET http://localhost:3000/treinos/:id
Authorization: Bearer <seu_token_aqui>
```

**Resposta esperada (200):** objeto completo do treino (mesmo formato do item de criação).

**Resposta se não encontrado (404):**
```json
{ "erro": "Treino não encontrado." }
```

---

### 5.4 Cancelar treino

> Somente o **criador** do treino pode cancelar.

```
DELETE http://localhost:3000/treinos/:id
Authorization: Bearer <seu_token_aqui>
```

**Resposta esperada (200):**
```json
{
  "mensagem": "Treino cancelado com sucesso.",
  "treino": {
    "id": "3b4c87d3-...",
    "status": "cancelado",
    ...
  }
}
```

**Validações ativas:**
| Situação | Status | Mensagem |
|---|---|---|
| Treino não existe | 404 | `Treino não encontrado.` |
| Usuário não é o criador | 403 | `Apenas o criador pode cancelar este treino.` |
| Já cancelado | 409 | `Este treino já foi cancelado.` |

---

## 6. Cenários de erro comuns

### Sem token
```
GET http://localhost:3000/treinos
(sem header Authorization)
```
**Resposta (401):**
```json
{ "erro": "Token de autenticação não fornecido." }
```

### Token inválido ou expirado
```
GET http://localhost:3000/treinos
Authorization: Bearer token_invalido_aqui
```
**Resposta (401):**
```json
{ "erro": "Token inválido ou expirado." }
```

---

## 7. Roteiro via Postman (complemento ao front)

Use para mostrar as respostas JSON brutas da API enquanto o front está aberto:

```
1. GET  /health                          → confirma servidor no ar

2. POST /auth/cadastro                   → cria usuário, retorna token JWT
   ↳ copiar o token da resposta

3. POST /auth/login                      → mesmo e-mail/senha → novo token

4. GET  /auth/me  (com token)            → mostra dados do usuário logado

5. GET  /treinos  (com token)            → lista treinos criados no front

6. POST /treinos  (com token)            → cria treino via API diretamente
   ↳ copiar o id do treino da resposta

7. GET  /treinos/:id  (com token)        → detalhe do treino criado

8. DELETE /treinos/:id  (com token)      → cancela o treino
   ↳ atualizar o front: treino some da lista

9. GET  /treinos  (sem token)            → erro 401 — demonstra proteção de rota
```

---

## 8. Testando via curl (terminal)

Se preferir usar o terminal, aqui está o script completo:

```bash
# 1. Cadastro (salva o token numa variável)
TOKEN=$(curl -s -X POST http://localhost:3000/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Lima","email":"ana@teste.com","senha":"123456"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. Criar treino (salva o id)
TREINO_ID=$(curl -s -X POST http://localhost:3000/treinos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"data":"2026-06-15","horario":"07:00","local":"Parque Municipal","tipo":"corrida_leve","descricao":"Treino leve","paceEsperado":"6:00/km"}' \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Treino ID: $TREINO_ID"

# 3. Listar treinos
curl -s http://localhost:3000/treinos \
  -H "Authorization: Bearer $TOKEN"

# 4. Detalhe
curl -s http://localhost:3000/treinos/$TREINO_ID \
  -H "Authorization: Bearer $TOKEN"

# 5. Cancelar
curl -s -X DELETE http://localhost:3000/treinos/$TREINO_ID \
  -H "Authorization: Bearer $TOKEN"

# 6. Lista vazia após cancelamento
curl -s http://localhost:3000/treinos \
  -H "Authorization: Bearer $TOKEN"
```
