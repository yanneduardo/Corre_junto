const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const SALT_ROUNDS = 10;

const UsuarioModel = {
  async criar({ nome, email, senha }) {
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const usuario = {
      id: uuidv4(),
      nome,
      email: email.toLowerCase().trim(),
      senhaHash,
      criadoEm: new Date().toISOString(),
    };
    db.usuarios.push(usuario);
    return this._semSenha(usuario);
  },

  buscarPorEmail(email) {
    return db.usuarios.find(
      (u) => u.email === email.toLowerCase().trim()
    ) || null;
  },

  buscarPorId(id) {
    return db.usuarios.find((u) => u.id === id) || null;
  },

  async verificarSenha(senhaPlana, senhaHash) {
    return bcrypt.compare(senhaPlana, senhaHash);
  },

  _semSenha(usuario) {
    const { senhaHash, ...publico } = usuario;
    return publico;
  },
};

module.exports = UsuarioModel;
