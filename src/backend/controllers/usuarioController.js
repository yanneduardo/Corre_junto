const pool = require('../config/database');

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

// Obter perfil público do usuário
exports.obterPerfilPublico = async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // Buscar dados públicos do usuário
    const [usuarios] = await pool.execute(
      'SELECT id, nome, bio, running_level, profile_picture_url, whatsapp, whatsapp_public FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = usuarios[0];

    // Contar treinos criados
    const [treinosCriados] = await pool.execute(
      'SELECT COUNT(*) as total FROM treinos WHERE criador_id = ?',
      [usuarioId]
    );

    // Retornar dados públicos
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
