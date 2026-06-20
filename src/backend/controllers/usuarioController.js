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
