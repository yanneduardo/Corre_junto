const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authController = {
  /**
   * POST /auth/cadastro
   * Cria um novo usuário e retorna o token JWT.
   */
  async cadastro(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Os campos nome, email e senha são obrigatórios.' });
    }

    if (!REGEX_EMAIL.test(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const existente = await UsuarioModel.buscarPorEmail(email);
    if (existente) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    const usuario = await UsuarioModel.criar({ nome, email, senha });
    const token = _gerarToken(usuario.id);

    return res.status(201).json({ token, usuario });
  },

  /**
   * POST /auth/login
   * Autentica um usuário e retorna o token JWT.
   */
  async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await UsuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await UsuarioModel.verificarSenha(senha, usuario.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = _gerarToken(usuario.id);
    return res.json({ token, usuario: UsuarioModel._semSenha(usuario) });
  },

  /**
   * GET /auth/me
   * Retorna os dados do usuário autenticado.
   */
  me(req, res) {
    return res.json({ usuario: req.usuario });
  },
};

function _gerarToken(usuarioId) {
  return jwt.sign(
    { id: usuarioId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = authController;
