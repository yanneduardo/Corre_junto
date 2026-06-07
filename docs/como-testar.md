# Como Testar a API CorreJunto

> Guia direto ao ponto para testar todos os endpoints da Sprint 1.  
> Ferramenta recomendada: **Postman** ou **Thunder Client** (extensão do VS Code).  
> Alternativa via terminal: **curl** (exemplos incluídos para tudo).

---

## 1. Subindo o servidor

```bash
cd src
npm run dev
```

O servidor responde em: `http://localhost:3000`

> **Atenção:** os dados ficam em memória. Ao reiniciar o servidor, tudo é apagado.

---

## 2. Verificando se está no ar

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

## 3. Autenticação

### 3.1 Cadastro de usuário

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

### 3.2 Login

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

### 3.3 Verificar usuário logado

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

## 4. Treinos

> Todos os endpoints de treino exigem o header:
> ```
> Authorization: Bearer <seu_token_aqui>
> ```

---

### 4.1 Criar treino

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

### 4.2 Listar treinos ativos

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

### 4.3 Ver detalhes de um treino

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

### 4.4 Cancelar treino

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

## 5. Cenários de erro comuns

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

## 6. Roteiro completo de demonstração (ordem recomendada)

Siga esta sequência para mostrar o sistema funcionando do zero:

```
1. GET  /health                          → confirma que o servidor está no ar

2. POST /auth/cadastro                   → cria usuário "Ana Lima"
   ↳ copiar o token da resposta

3. POST /auth/login                      → faz login com as mesmas credenciais
   ↳ confirma que o token é gerado novamente

4. GET  /auth/me                         → mostra os dados do usuário logado

5. GET  /treinos                         → lista vazia (nenhum treino ainda)

6. POST /treinos                         → cria treino "Longão de domingo"
   ↳ copiar o id do treino da resposta

7. GET  /treinos                         → agora aparece 1 treino na lista

8. GET  /treinos/:id                     → detalhe completo do treino criado

9. DELETE /treinos/:id                   → cancela o treino

10. GET /treinos                         → lista vazia novamente (cancelado não aparece)

11. GET /treinos                         → sem token → erro 401 (demonstra autenticação)
```

---

## 7. Testando via curl (terminal)

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
