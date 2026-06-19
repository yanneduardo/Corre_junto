const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const SALT_ROUNDS = 10;

const UsuarioModel = {
  async criar({ nome, email, senha }) {
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO usuarios (id, nome, email, senha_hash) VALUES (?, ?, ?, ?)',
      [id, nome, email.toLowerCase().trim(), senhaHash]
    );
    return { id, nome, email: email.toLowerCase().trim(), criadoEm: new Date().toISOString() };
  },

  async buscarPorEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, nome, email, senha_hash, criado_em FROM usuarios WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return { id: r.id, nome: r.nome, email: r.email, senhaHash: r.senha_hash, criadoEm: r.criado_em };
  },

  async buscarPorId(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, email, senha_hash, criado_em FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return { id: r.id, nome: r.nome, email: r.email, senhaHash: r.senha_hash, criadoEm: r.criado_em };
  },

  async verificarSenha(senhaPlana, senhaHash) {
    return bcrypt.compare(senhaPlana, senhaHash);
  },

  _semSenha(usuario) {
    if (!usuario) return null;
    const { senhaHash, ...publico } = usuario;
    return publico;
  },
};

module.exports = UsuarioModel;
