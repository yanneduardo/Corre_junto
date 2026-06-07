const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const TIPOS_VALIDOS = ['corrida_leve', 'intervalado', 'longao'];

const STATUS = {
  ATIVO: 'ativo',
  CANCELADO: 'cancelado',
};

const TreinoModel = {
  criar({ data, horario, local, tipo, descricao, paceEsperado, criadorId }) {
    const treino = {
      id: uuidv4(),
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
    db.treinos.push(treino);
    return treino;
  },

  listarAtivos() {
    return db.treinos.filter((t) => t.status === STATUS.ATIVO);
  },

  buscarPorId(id) {
    return db.treinos.find((t) => t.id === id) || null;
  },

  cancelar(id) {
    const treino = db.treinos.find((t) => t.id === id);
    if (!treino) return null;
    treino.status = STATUS.CANCELADO;
    treino.atualizadoEm = new Date().toISOString();
    return treino;
  },

  TIPOS_VALIDOS,
  STATUS,
};

module.exports = TreinoModel;
