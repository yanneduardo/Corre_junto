const pool = require('../config/database');
const UsuarioModel = require('../models/usuario');

// Obter estatísticas de treinos do usuário
exports.obterEstatisticasTreinos = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const [treinosCriados] = await pool.execute(
      'SELECT COUNT(*) as total FROM treinos WHERE criador_id = ?',
      [usuarioId]
    );
    const [treinosParticipa] = await pool.execute(
      'SELECT COUNT(*) as total FROM treino_participantes WHERE usuario_id = ?',
      [usuarioId]
    );
    res.json({
      created: treinosCriados[0].total,
      participated: treinosParticipa[0].total
    });
  } catch (erro) {
    console.error('Erro ao obter estatísticas:', erro);
    res.status(500).json({ erro: 'Erro ao obter estatísticas de treinos' });
  }
};

// Obter perfil público do usuário
exports.obterPerfilPublico = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const [usuarios] = await pool.execute(
      'SELECT id, nome, bio, running_level, profile_picture_url, whatsapp, whatsapp_public FROM usuarios WHERE id = ?',
      [usuarioId]
    );
    if (usuarios.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    const usuario = usuarios[0];
    const [treinosCriados] = await pool.execute(
      'SELECT COUNT(*) as total FROM treinos WHERE criador_id = ?',
      [usuarioId]
    );
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      bio: usuario.bio || '',
      running_level: usuario.running_level || 'Iniciante',
      profile_picture_url: usuario.profile_picture_url || null,
      whatsapp: usuario.whatsapp_public ? usuario.whatsapp : null,
      treinos_criados: treinosCriados[0].total
    });
  } catch (erro) {
    console.error('Erro ao obter perfil público:', erro);
    res.status(500).json({ erro: 'Erro ao obter perfil público' });
  }
};

exports.atualizarBio = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.usuario.id !== id) {
      return res.status(403).json({ erro: 'Você só pode editar o seu próprio perfil.' });
    }
    const { bio, runningLevel } = req.body;
    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string') {
        return res.status(400).json({ erro: 'A biografia deve ser um texto.' });
      }
      if (bio.length > UsuarioModel.BIO_MAX_LENGTH) {
        return res.status(400).json({
          erro: `A biografia deve ter no máximo ${UsuarioModel.BIO_MAX_LENGTH} caracteres.`,
        });
      }
    }
    if (runningLevel !== undefined && runningLevel !== null) {
      if (!UsuarioModel.NIVEIS_VALIDOS.includes(runningLevel)) {
        return res.status(400).json({
          erro: `Nível de corrida inválido. Valores aceitos: ${UsuarioModel.NIVEIS_VALIDOS.join(', ')}.`,
        });
      }
    }
    const usuarioAtualizado = await UsuarioModel.atualizarPerfil(id, { bio, runningLevel });
    return res.json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: UsuarioModel._semSenha(usuarioAtualizado),
    });
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
};

exports.buscarPerfil = async (req, res) => {
  try {
    const usuario = await UsuarioModel.buscarPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.json({ usuario: UsuarioModel._semSenha(usuario) });
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
};
