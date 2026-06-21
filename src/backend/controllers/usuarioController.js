const pool = require('../config/database');
const UsuarioModel = require('../models/usuario');

// Obter estatísticas de treinos do usuário
exports.obterEstatisticasTreinos = async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // Contar treinos CRIADOS
    const [treinosCriados] = await pool.execute(
      'SELECT COUNT(*) as total FROM treinos WHERE criador_id = ?',
      [usuarioId]
    );

    // Contar treinos que PARTICIPA
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

/**
 * PUT /usuarios/:id/bio
 * Atualiza a biografia e/ou nível de corrida do usuário autenticado.
 * Apenas o próprio usuário pode editar seu perfil.
 */
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

/**
 * GET /usuarios/:id
 * Retorna os dados públicos do perfil de um usuário (nome, bio, nível).
 */
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
