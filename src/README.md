# CorreJunto — Execução

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- npm v9+ (incluído no Node)

## Instalação e execução

```bash
git clone https://github.com/seu-usuario/correjunto.git
cd correjunto/src
npm install
cp .env.example .env
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `NODE_ENV` | `development` | Ambiente de execução |

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento com hot reload |
| `npm start` | Produção |

## Estrutura

```
src/
├── controllers/    # Lógica das rotas
├── routes/         # Definição das rotas
├── middlewares/    # Middlewares
├── config/         # Configurações
├── app.js          # Configuração do Express
└── server.js       # Ponto de entrada
```

## Rotas disponíveis

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Informações da API |
| GET | `/health` | Status do servidor |
