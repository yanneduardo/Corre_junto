const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario');

const autenticar = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  const segredo = process.env.JWT_SECRET;

  if (!segredo) {
    return res.status(500).json({ erro: 'Configuração de segurança ausente no servidor.' });
  }

  try {
    const payload = jwt.verify(token, segredo);
    const usuario = await UsuarioModel.buscarPorId(payload.id);
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado.' });
    req.usuario = UsuarioModel._semSenha(usuario);
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

module.exports = { autenticar };
