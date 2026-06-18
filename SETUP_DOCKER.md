# Setup com Docker no WSL

## Pré-requisitos
- WSL 2 instalado (Windows Subsystem for Linux)
- Docker Desktop instalado e rodando (com integração WSL 2 ativada)
- Git

## Passos para Testar

### 1. Clone ou navegue até o projeto
```bash
cd /mnt/c/Users/yanns/engenharia2/Corre_junto/Corre_junto
```

### 2. Configure o arquivo `.env` local
Copie o arquivo de exemplo:
```bash
cp src/.env.example src/.env
```

Edite `src/.env` se necessário (as credenciais abaixo já estão pré-configuradas no `docker-compose.yml`):
```
DB_HOST=mysql
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=senha123
DB_NAME=corre_junto
JWT_SECRET=mude_este_segredo_em_producao
```

### 3. Inicie os containers
```bash
docker-compose up -d
```

Isso vai:
- Criar um container MySQL com o schema automaticamente aplicado
- Criar um container Node.js e rodar `npm run dev`

### 4. Verifique se está tudo rodando
```bash
docker-compose ps
```

Deve mostrar ambos os serviços em estado `Up`.

### 5. Teste a API
Abra o terminal e teste os endpoints:

**Cadastro:**
```bash
curl -X POST http://localhost:3000/auth/cadastro \
  -H 'Content-Type: application/json' \
  -d '{"nome":"João","email":"joao@example.com","senha":"123456"}'
```

Você deve receber um JSON com `token` e `usuario`.

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"joao@example.com","senha":"123456"}'
```

Copie o `token` retornado.

**Criar Treino (use o token):**
```bash
curl -X POST http://localhost:3000/treinos \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN_AQUI>' \
  -d '{"data":"2026-06-20","horario":"07:00","local":"Parque Central","tipo":"corrida_leve","descricao":"Corrida leve matinal"}'
```

**Listar Treinos:**
```bash
curl -X GET http://localhost:3000/treinos \
  -H 'Authorization: Bearer <TOKEN_AQUI>'
```

### 6. Acesse o Frontend
Abra seu navegador em:
```
http://localhost:3000
```

Verá a interface do CorreJunto. O frontend já está integrado ao backend — faça login ou cadastre-se para começar!

**Notas sobre o Frontend:**
- Arquivos estáticos (HTML, CSS, JS) estão em `src/frontend/`
- Express (backend) serve esses arquivos automaticamente
- URLs da API (em `src/frontend/js/app.js`): `/auth/cadastro`, `/auth/login`, `/treinos`, etc.
- Tudo roda no mesmo container Node.js, mesma porta (3000)

### 7. Parar os containers
```bash
docker-compose down
```

Para parar e remover volumes (limpar banco):
```bash
docker-compose down -v
```

## Troubleshooting

**"Connection refused" ou "Can't connect to MySQL"**
- Aguarde 10-15s para o MySQL estar pronto (verifique com `docker-compose logs mysql`)
- Verifique se `DB_HOST=mysql` em `.env` (não use `localhost` dentro do container)

**"Module not found" (dependências Node)**
- Limpe e reinstale:
  ```bash
  docker-compose down -v
  rm -rf src/node_modules src/package-lock.json
  docker-compose up -d --build
  ```

**Portas já em uso (3306 ou 3000)**
- Mude as portas no `docker-compose.yml`:
  ```yaml
  ports:
    - "3307:3306"  # MySQL em porta local 3307
    - "3001:3000"  # Backend em porta local 3001
  ```

## Estrutura do Projeto
```
src/
  ├── backend/
  │   ├── app.js                 # Express app
  │   ├── server.js              # Inicializa servidor
  │   ├── config/database.js     # Pool MySQL
  │   ├── models/               # Modelos (UsuarioModel, TreinoModel)
  │   ├── controllers/          # Controladores (authController, treinoController)
  │   ├── routes/               # Rotas (auth.js, treinos.js, index.js)
  │   └── middlewares/          # Middlewares (auth.js)
  ├── data/
  │   └── mysql-schema.sql      # Schema inicial
  ├── package.json
  └── .env                       # Variáveis de ambiente (local)
```

## Endpoints Disponíveis

### Auth
- `POST /auth/cadastro` — Criar novo usuário
- `POST /auth/login` — Login (retorna token)
- `GET /auth/me` — Dados do usuário autenticado (requer token)

### Treinos
- `GET /treinos` — Listar treinos ativos (requer token)
- `GET /treinos/:id` — Detalhes de um treino (requer token)
- `POST /treinos` — Criar novo treino (requer token)
- `DELETE /treinos/:id` — Cancelar treino (criador apenas, requer token)
- `POST /treinos/:id/participar` — Participar de um treino (requer token)

### Home
- `GET /` — Status da API
- `GET /health` — Health check

## Próximos Passos
- [ ] Adicionar testes automatizados
- [ ] Criar frontend (se aplicável)
- [ ] Documentar API com Swagger/OpenAPI
- [ ] Configurar CI/CD (GitHub Actions, etc.)
