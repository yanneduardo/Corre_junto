# 🏃‍♂️ CorreJunto

## 📌 Ideia Geral

O **CorreJunto** é um sistema web voltado para corredores que desejam encontrar parceiros de treino, divulgar provas de corrida e acessar dicas relacionadas ao esporte.

O objetivo é facilitar a conexão entre pessoas com interesses em comum, incentivando a prática de corrida em grupo e promovendo eventos da comunidade.

---

## 💻 Descrição do Sistema

O sistema é dividido em três principais módulos:

### 🏃‍♀️ Treinos

Permite que usuários criem e participem de treinos em grupo.

#### Funcionalidades:
- Criação de treinos com:
  - Data
  - Horário
  - Local
  - Tipo de treino (corrida leve, intervalado, longão, etc.)
  - Pace médio esperado
- Participação em treinos:
  - Botão **Participar**
  - Botão **Sair do treino**
- Lista de participantes
- Descrição do treino
- Geração automática de evento ao confirmar presença (Google Calendar ou arquivo `.ics`)

---

### 🏁 Provas

Espaço para divulgação de provas de corrida.

#### Funcionalidades:
- Usuários podem solicitar divulgação de provas
- Gerentes analisam e:
  - Aprovam
  - Recusam
- Informações das provas:
  - Data da prova
  - Data limite de inscrição
  - Valores
  - Percurso
  - Distância (5km, 10km, etc.)

---

### 💡 Dicas

Área destinada ao compartilhamento de dicas sobre corrida.

---

### 👤 Perfil do Usuário

Cada usuário possui um perfil com:

- Foto
- Bio
- Nível de corrida
- Quantidade de treinos criados
- Contato com link direto para WhatsApp

---

## 🚫 Limitações

- O sistema **não possui chat interno**
- A comunicação entre usuários será feita externamente (ex: WhatsApp)

---

## 🧩 Entidades Principais

- Usuário
- Treino
- Participação (relação entre usuário e treino)
- Prova

---

## 🔗 Relacionamentos

- Usuário cria → Treino  
- Usuário participa → Treino  
- Usuário solicita → Prova  

---

## 🎯 Objetivo

Desenvolver um sistema simples e funcional que permita:

- Organização de treinos em grupo  
- Divulgação de eventos de corrida  
- Compartilhamento de informações úteis para corredores  

---

## 👥 Integrantes do Projeto

- Hugo Augusto Silva de Faria  
- Yann Eduardo  
- Lucas Arthur Menezes Freire  
- Lucas Oliveira Brandão 
- Victor  

---

## 🚀 Como Começar

### Instalação

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd Corre_junto

# Instalar dependências do backend
cd src
npm install

# Configurar arquivo .env (ver exemplo em .env.example)
# Necessário:
# - DB_HOST
# - DB_USER
# - DB_PASSWORD
# - DB_NAME
# - JWT_SECRET
```

### Executar

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

---

## 🧪 Testes e Qualidade

### Executar Testes

```bash
npm test                 # Rodar todos os testes
npm test:watch          # Modo watch (reexecuta ao salvar)
npm run test:coverage   # Gerar relatório de cobertura (opcional)
```

### Cobertura de Testes

✅ **100% de cobertura** nos arquivos críticos:
- `usuarioController.js` - 100%
- `usuario.js` (Model) - 100%

- **24 testes** automatizados
- **0 falhas** de testes
- **Validações completas** de dados e permissões

### Documentação

- 📡 [**API_ENDPOINTS.md**](API_ENDPOINTS.md) - Exemplos de requisições/respostas
- 📚 [**TESTING.md**](TESTING.md) - Guia de testes
- 🗄️ [**DATABASE.md**](DATABASE.md) - Estrutura do banco de dados
- 💻 [**FRONTEND_GUIDE.md**](FRONTEND_GUIDE.md) - Como usar os endpoints no frontend

---

## 📋 Funcionalidades Implementadas

### ✅ Perfil de Usuário (v1.0)

#### Endpoints
- `GET /usuarios/:id` - Ver perfil público
- `PUT /usuarios/:id/bio` - Editar bio e nível de corrida
- `GET /usuarios/:id/training-stats` - Obter estatísticas de treinos

#### Validações
- ✅ Bio (máx 500 caracteres)
- ✅ Running Level (iniciante, intermediario, avancado)
- ✅ Email normalizado (minúsculas, sem espaços)
- ✅ Permissões (usuário só edita seu próprio perfil)

#### Segurança
- ✅ JWT autenticado
- ✅ Senhas com bcrypt
- ✅ Validação de dados na entrada

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + Express
- **MySQL 8.0**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript Vanilla**

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de API

---

## 📊 Estrutura do Projeto

```
Corre_junto/
├── src/
│   ├── backend/
│   │   ├── controllers/
│   │   │   ├── usuarioController.js
│   │   │   ├── authController.js
│   │   │   └── ...
│   │   ├── models/
│   │   │   ├── usuario.js
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── usuarios.js
│   │   │   ├── auth.js
│   │   │   └── ...
│   │   ├── middlewares/
│   │   │   └── auth.js
│   │   ├── __tests__/
│   │   │   ├── usuario.test.js
│   │   │   └── controller.test.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── app.js
│   │   └── server.js
│   └── frontend/
│       ├── index.html
│       ├── css/
│       └── js/
├── API_ENDPOINTS.md
├── TESTING.md
├── DATABASE.md
├── FRONTEND_GUIDE.md
└── README.md
```

---

## 🔐 Variáveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=corre_junto

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Servidor
PORT=3000
NODE_ENV=development
```

---

## 📈 Próximas Funcionalidades

- [x] Upload de foto de perfil
- [ ] Sistema de avaliação entre usuários
- [ ] Filtro de treinos por localização
- [ ] Integração com Google Calendar
- [ ] Notificações por email
- [ ] Chat interno

---

## 🐛 Reportar Bugs

Para reportar bugs, abra uma issue no repositório com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual

---

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

## 📝 Licença

Este projeto está sob licença ISC.
