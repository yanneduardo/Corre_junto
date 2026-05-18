# CorreJunto — Instruções de Execução

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior (já vem com o Node)
- [Git](https://git-scm.com/)

Para verificar se estão instalados corretamente:

```bash
node -v
npm -v
git --version
```

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/correjunto.git
cd correjunto
```

### 2. Acesse a pasta do código-fonte

```bash
cd src
```

### 3. Instale as dependências

```bash
npm install
```

---

## Configuração

### 4. Configure as variáveis de ambiente

Copie o arquivo de exemplo e edite com suas configurações locais:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha as variáveis:

```env
PORT=3000
NODE_ENV=development

# Banco de dados (a definir)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=correjunto
DB_USER=seu_usuario
DB_PASS=sua_senha
```

---

## Execução

### Modo desenvolvimento (com hot reload)

```bash
npm run dev
```

### Modo produção

```bash
npm start
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com nodemon |
| `npm start` | Inicia o servidor em modo produção |
| `npm test` | Executa os testes |

---

## Estrutura da pasta `src`

```
src/
├── controllers/     # Lógica de cada rota
├── models/          # Modelos do banco de dados
├── routes/          # Definição das rotas da API
├── middlewares/     # Middlewares (autenticação, validação, etc.)
├── config/          # Configurações (banco, ambiente, etc.)
├── app.js           # Configuração do Express
├── server.js        # Ponto de entrada da aplicação
├── .env.example     # Exemplo de variáveis de ambiente
└── README.md        # Este arquivo
```

---

## Dependências principais

| Pacote | Finalidade |
|---|---|
| `express` | Framework web |
| `dotenv` | Variáveis de ambiente |
| `nodemon` | Hot reload em desenvolvimento |

---

## Integrantes

- Hugo Augusto Silva de Faria
- Yann Eduardo
- Lucas Arthur Menezes Freire
- Lucas Oliveira Brandão
- Victor
