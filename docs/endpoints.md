# 📡 Endpoints da API - Corre Junto

## Base URL
```
http://localhost:3000
```

## 🔐 Autenticação

Todos os endpoints requerem um token JWT no header:

```
Authorization: Bearer {token}
```

Exemplo:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5..." http://localhost:3000/usuarios/123
```

---

## 👤 Endpoints de Usuário

### 1. GET /usuarios/:id
**Obter perfil público de um usuário**

#### Request
```bash
GET /usuarios/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

#### Response 200 OK
```json
{
  "usuario": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao@example.com",
    "bio": "Corredor iniciante buscando parceiros",
    "runningLevel": "iniciante",
    "criadoEm": "2024-06-21T10:30:00.000Z"
  }
}
```

#### Response 404 Not Found
```json
{
  "erro": "Usuário não encontrado."
}
```

#### Response 401 Unauthorized
```json
{
  "erro": "Token de autenticação não fornecido."
}
```

---

### 2. PUT /usuarios/:id/bio
**Atualizar biografia e nível de corrida**

**Restrição**: Apenas o próprio usuário pode editar seu perfil

#### Request
```bash
PUT /usuarios/550e8400-e29b-41d4-a716-446655440000/bio
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Corredor intermediário, 5 anos de experiência",
  "runningLevel": "intermediario"
}
```

#### Response 200 OK
```json
{
  "mensagem": "Perfil atualizado com sucesso.",
  "usuario": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao@example.com",
    "bio": "Corredor intermediário, 5 anos de experiência",
    "runningLevel": "intermediario"
  }
}
```

#### Response 400 Bad Request - Bio inválida
```json
{
  "erro": "A biografia deve ser um texto."
}
```

#### Response 400 Bad Request - Bio muito longa
```json
{
  "erro": "A biografia deve ter no máximo 500 caracteres."
}
```

#### Response 400 Bad Request - Running Level inválido
```json
{
  "erro": "Nível de corrida inválido. Valores aceitos: iniciante, intermediario, avancado."
}
```

#### Response 403 Forbidden
```json
{
  "erro": "Você só pode editar o seu próprio perfil."
}
```

---

### 3. GET /usuarios/:id/training-stats
**Obter estatísticas de treinos**

#### Request
```bash
GET /usuarios/550e8400-e29b-41d4-a716-446655440000/training-stats
Authorization: Bearer {token}
```

#### Response 200 OK
```json
{
  "created": 5,
  "participated": 12
}
```

Campos:
- `created`: Número de treinos que o usuário criou
- `participated`: Número de treinos que o usuário participou

#### Response 401 Unauthorized
```json
{
  "erro": "Token de autenticação não fornecido."
}
```

---

## 📋 Validações

### Bio
- **Tipo**: String
- **Máximo**: 500 caracteres
- **Obrigatório**: Não (pode ser null)

### Running Level (Nível de Corrida)
- **Valores válidos**:
  - `"iniciante"`
  - `"intermediario"`
  - `"avancado"`
- **Obrigatório**: Não (pode ser null)
- **Case-sensitive**: Sim

---

## 🧪 Testando com cURL

### Atualizar perfil
```bash
curl -X PUT http://localhost:3000/usuarios/550e8400-e29b-41d4-a716-446655440000/bio \
  -H "Authorization: Bearer seu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Corredor experiente",
    "runningLevel": "avancado"
  }'
```

### Obter perfil
```bash
curl -H "Authorization: Bearer seu_token_aqui" \
  http://localhost:3000/usuarios/550e8400-e29b-41d4-a716-446655440000
```

### Obter estatísticas
```bash
curl -H "Authorization: Bearer seu_token_aqui" \
  http://localhost:3000/usuarios/550e8400-e29b-41d4-a716-446655440000/training-stats
```

---

## 🧩 Testando com Postman

1. Abra o Postman
2. Crie uma nova requisição
3. Configure o header:
   - Key: `Authorization`
   - Value: `Bearer {seu_token}`
4. Teste os endpoints acima

---

## 📊 Códigos de Status HTTP

| Código | Significado |
|--------|------------|
| 200 | ✅ Sucesso |
| 400 | ⚠️ Erro na validação |
| 401 | 🔒 Sem autenticação |
| 403 | 🚫 Sem permissão |
| 404 | ❌ Não encontrado |
| 500 | 🔥 Erro no servidor |

---

**Última atualização**: 2026-06-21
