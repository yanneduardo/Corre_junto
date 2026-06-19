const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

const TIPOS_VALIDOS = ['corrida_leve', 'intervalado', 'longao'];

const STATUS = {
  ATIVO: 'ativo',
  CANCELADO: 'cancelado',
};

const TreinoModel = {
  async criar({ data, horario, local, tipo, descricao, paceEsperado, criadorId }) {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO treinos (id, data, horario, local, tipo, descricao, pace_esperado, criador_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data, horario, local, tipo, descricao || null, paceEsperado || null, criadorId]
    );
    await pool.execute('INSERT INTO treino_participantes (treino_id, usuario_id) VALUES (?, ?)', [id, criadorId]);
    return {
      id,
      data,
      horario,
      local,
      tipo,
      descricao: descricao || null,
      paceEsperado: paceEsperado || null,
      criadorId,
      status: STATUS.ATIVO,
      participantes: [criadorId],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
  },

  async listarAtivosParaUsuario(usuarioId) {
    const [rows] = await pool.execute(
      `SELECT t.id,
              t.data,
              t.horario,
              t.local,
              t.tipo,
              t.descricao,
              t.pace_esperado,
              t.status,
              t.criador_id,
              u.nome AS criador_nome,
              EXISTS(SELECT 1 FROM treino_participantes tp WHERE tp.treino_id = t.id AND tp.usuario_id = ?) AS participando,
              (SELECT COUNT(*) FROM treino_participantes tp WHERE tp.treino_id = t.id) AS total_participantes
       FROM treinos t
       JOIN usuarios u ON u.id = t.criador_id
       WHERE t.status = 'ativo'`,
      [usuarioId]
    );
    return rows.map((r) => ({
      id: r.id,
      data: r.data,
      horario: r.horario,
      local: r.local,
      tipo: r.tipo,
      descricao: r.descricao,
      paceEsperado: r.pace_esperado,
      status: r.status,
      criadorId: r.criador_id,
      criadorNome: r.criador_nome,
      totalParticipantes: Number(r.total_participantes),
      participando: Boolean(r.participando),
    }));
  },

  async buscarPorIdComUsuario(id, usuarioId) {
    const [rows] = await pool.execute(
      `SELECT t.id,
              t.data,
              t.horario,
              t.local,
              t.tipo,
              t.descricao,
              t.pace_esperado,
              t.status,
              t.criador_id,
              u.nome AS criador_nome,
              EXISTS(SELECT 1 FROM treino_participantes tp WHERE tp.treino_id = t.id AND tp.usuario_id = ?) AS participando,
              (SELECT COUNT(*) FROM treino_participantes tp WHERE tp.treino_id = t.id) AS total_participantes
       FROM treinos t
       JOIN usuarios u ON u.id = t.criador_id
       WHERE t.id = ?`,
      [usuarioId, id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      data: r.data,
      horario: r.horario,
      local: r.local,
      tipo: r.tipo,
      descricao: r.descricao,
      paceEsperado: r.pace_esperado,
      status: r.status,
      criadorId: r.criador_id,
      criadorNome: r.criador_nome,
      totalParticipantes: Number(r.total_participantes),
      participando: Boolean(r.participando),
    };
  },

  async atualizar(id, { data, horario, local, tipo, descricao, paceEsperado }) {
    await pool.execute(
      'UPDATE treinos SET data = ?, horario = ?, local = ?, tipo = ?, descricao = ?, pace_esperado = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
      [data, horario, local, tipo, descricao || null, paceEsperado || null, id]
    );
    const [rows] = await pool.execute('SELECT id, data, horario, local, tipo, descricao, pace_esperado, status, criador_id, criado_em, atualizado_em FROM treinos WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      data: r.data,
      horario: r.horario,
      local: r.local,
      tipo: r.tipo,
      descricao: r.descricao,
      paceEsperado: r.pace_esperado,
      status: r.status,
      criadorId: r.criador_id,
      criadoEm: r.criado_em,
      atualizadoEm: r.atualizado_em,
    };
  },

  async cancelar(id) {
    await pool.execute('UPDATE treinos SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?', [STATUS.CANCELADO, id]);
    const [rows] = await pool.execute('SELECT id, data, horario, local, tipo, descricao, pace_esperado, status, criador_id, criado_em, atualizado_em FROM treinos WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      data: r.data,
      horario: r.horario,
      local: r.local,
      tipo: r.tipo,
      descricao: r.descricao,
      paceEsperado: r.pace_esperado,
      status: r.status,
      criadorId: r.criador_id,
      criadoEm: r.criado_em,
      atualizadoEm: r.atualizado_em,
    };
  },
  removerParticipante(id, usuarioId) {
    const treino = db.treinos.find((t) => t.id === id);
    if (!treino) return null;
    const idx = treino.participantes.indexOf(usuarioId);
    if (idx === -1) return treino;
    treino.participantes.splice(idx, 1);
    treino.atualizadoEm = new Date().toISOString();
    return treino;
  },

  TIPOS_VALIDOS,
  STATUS,
};

module.exports = TreinoModel;
