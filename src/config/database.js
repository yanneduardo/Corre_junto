/**
 * Banco de dados em memória.
 * Substitua por uma conexão real (ex.: SQLite, PostgreSQL) quando disponível.
 * Todas as coleções são arrays simples acessados pelos models.
 */
const db = {
  usuarios: [],
  treinos: [],
};

module.exports = db;
