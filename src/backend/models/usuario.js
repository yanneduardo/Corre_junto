const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const SALT_ROUNDS = 10;

const NIVEIS_VALIDOS = ['iniciante', 'intermediario', 'avancado'];
const BIO_MAX_LENGTH = 500;
const TIPOS_FOTO_VALIDOS = ['image/jpeg', 'image/jpg', 'image/png'];
const FOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB

const UsuarioModel = {
  NIVEIS_VALIDOS,
  BIO_MAX_LENGTH,
  TIPOS_FOTO_VALIDOS,
  FOTO_MAX_BYTES,

  async criar({ nome, email, senha }) {
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO usuarios (id, nome, email, senha_hash) VALUES (?, ?, ?, ?)',
      [id, nome, email.toLowerCase().trim(), senhaHash]
    );
    return {
      id,
      nome,
      email: email.toLowerCase().trim(),
      bio: null,
      runningLevel: null,
      profilePictureUrl: null,
      criadoEm: new Date().toISOString(),
    };
  },

  async buscarPorEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, nome, email, senha_hash, bio, running_level, profile_picture_url, criado_em FROM usuarios WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );
    if (!rows || rows.length === 0) return null;
    return _mapearLinha(rows[0]);
  },

  async buscarPorId(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, email, senha_hash, bio, running_level, profile_picture_url, criado_em FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return _mapearLinha(rows[0]);
  },

  /**
   * Atualiza biografia, nível de corrida e/ou foto de perfil do usuário.
   * Aceita atualização parcial: apenas os campos enviados são alterados.
   * Para remover a foto de perfil, passe profilePictureUrl: null explicitamente.
   */
  async atualizarPerfil(id, { bio, runningLevel, profilePictureUrl }) {
    const campos = [];
    const valores = [];

    if (bio !== undefined) {
      campos.push('bio = ?');
      valores.push(bio);
    }
    if (runningLevel !== undefined) {
      campos.push('running_level = ?');
      valores.push(runningLevel);
    }
    if (profilePictureUrl !== undefined) {
      campos.push('profile_picture_url = ?');
      valores.push(profilePictureUrl);
    }

    if (campos.length === 0) {
      return this.buscarPorId(id);
    }

    valores.push(id);
    await pool.execute(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);
    return this.buscarPorId(id);
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

function _mapearLinha(r) {
  return {
    id: r.id,
    nome: r.nome,
    email: r.email,
    senhaHash: r.senha_hash,
    bio: r.bio,
    runningLevel: r.running_level,
    profilePictureUrl: r.profile_picture_url,
    criadoEm: r.criado_em,
  };
}

module.exports = UsuarioModel;
