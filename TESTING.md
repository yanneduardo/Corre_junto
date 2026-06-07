# Testes Manuais — API CorreJunto

Base URL: `http://localhost:3000`

> Todas as rotas de treino exigem autenticação. Após login ou cadastro, copie o `token` retornado e use no header `Authorization: Bearer <token>`.

---

## 1. Autenticação

### 1.1 Cadastro de usuário

**POST** `/auth/cadastro`

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Esperado:** `201 Created`
```json
{
  "token": "<jwt>",
  "usuario": { "id": "...", "nome": "João Silva", "email": "joao@email.com" }
}
```

**Casos de erro:**
| Situação | Status esperado |
|---|---|
| Campo obrigatório ausente | `400` |
| E-mail inválido | `400` |
| Senha com menos de 6 caracteres | `400` |
| E-mail já cadastrado | `409` |

---

### 1.2 Login

**POST** `/auth/login`

```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Esperado:** `200 OK`
```json
{
  "token": "<jwt>",
  "usuario": { "id": "...", "nome": "João Silva", "email": "joao@email.com" }
}
```

**Casos de erro:**
| Situação | Status esperado |
|---|---|
| E-mail não cadastrado | `401` |
| Senha incorreta | `401` |
| Campo ausente | `400` |

---

### 1.3 Dados do usuário autenticado

**GET** `/auth/me`

Header: `Authorization: Bearer <token>`

**Esperado:** `200 OK` com os dados do usuário logado.

**Caso de erro:** token ausente ou inválido → `401`

---

## 2. Treinos

> Todos os endpoints abaixo exigem o header `Authorization: Bearer <token>`.

---

### 2.1 Criar treino

**POST** `/treinos`

```json
{
  "data": "2025-08-15",
  "horario": "07:00",
  "local": "Parque Municipal - Portão 2",
  "tipo": "corrida_leve",
  "paceEsperado": "5:30/km",
  "descricao": "Treino leve de 5km para iniciantes."
}
```

Valores válidos para `tipo`: `corrida_leve`, `intervalado`, `longao`

**Esperado:** `201 Created`
```json
{
  "mensagem": "Treino criado com sucesso.",
  "treino": { "id": "...", "data": "2025-08-15", "horario": "07:00", ... }
}
```

**Casos de erro:**
| Situação | Status esperado |
|---|---|
| Campo obrigatório ausente (`data`, `horario`, `local`, `tipo`) | `400` |
| Tipo inválido | `400` |
| Data fora do formato `AAAA-MM-DD` | `400` |
| Horário fora do formato `HH:MM` | `400` |
| Sem token | `401` |

---

### 2.2 Listar treinos

**GET** `/treinos`

**Esperado:** `200 OK`
```json
{
  "total": 1,
  "treinos": [ { "id": "...", "tipo": "corrida_leve", "criador": { "nome": "João Silva" }, ... } ]
}
```

---

### 2.3 Visualizar treino por ID

**GET** `/treinos/:id`

Substitua `:id` pelo ID retornado na criação.

**Esperado:** `200 OK` com todos os campos do treino + dados do criador.

**Caso de erro:** ID inexistente → `404`

---

### 2.4 Cancelar treino

**DELETE** `/treinos/:id`

Deve ser feito com o token do **criador** do treino.

**Esperado:** `200 OK`
```json
{
  "mensagem": "Treino cancelado com sucesso.",
  "treino": { "id": "...", "status": "cancelado", ... }
}
```

**Casos de erro:**
| Situação | Status esperado |
|---|---|
| ID inexistente | `404` |
| Token de outro usuário (não criador) | `403` |
| Treino já cancelado | `409` |

---

## 3. Fluxo completo sugerido

Execute nesta ordem para validar tudo de ponta a ponta:

1. `POST /auth/cadastro` — cria usuário A, salva o token
2. `POST /auth/cadastro` — cria usuário B, salva o token
3. `POST /auth/login` — loga com usuário A, confirma que o token funciona
4. `GET /auth/me` — confirma dados do usuário A
5. `POST /treinos` (token A) — cria um treino, salva o ID
6. `GET /treinos` (token A ou B) — confirma que o treino aparece na lista
7. `GET /treinos/:id` (token A ou B) — confirma os detalhes
8. `DELETE /treinos/:id` (token **B**) — deve retornar `403`
9. `DELETE /treinos/:id` (token **A**) — deve retornar `200`
10. `DELETE /treinos/:id` (token **A**) novamente — deve retornar `409`
