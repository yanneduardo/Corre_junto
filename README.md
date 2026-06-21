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

- [ ] Upload de foto de perfil
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

## 📝 Licença

Este projeto está sob licença ISC.
