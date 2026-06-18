const TreinoModel = require('../models/treino');
const UsuarioModel = require('../models/usuario');

const treinoController = {
  /**
   * POST /treinos
   * Cria um novo treino em grupo.
   */
  async criar(req, res) {
    const { data, horario, local, tipo, descricao, paceEsperado } = req.body;

    if (!data || !horario || !local || !tipo) {
      return res.status(400).json({
        erro: 'Os campos data, horario, local e tipo são obrigatórios.',
      });
    }

    if (!TreinoModel.TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        erro: `Tipo de treino inválido. Valores aceitos: ${TreinoModel.TIPOS_VALIDOS.join(', ')}.`,
      });
    }

    const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
    if (!REGEX_DATA.test(data)) {
      return res.status(400).json({ erro: 'Data inválida. Use o formato AAAA-MM-DD.' });
    }

    const REGEX_HORARIO = /^\d{2}:\d{2}$/;
    if (!REGEX_HORARIO.test(horario)) {
      return res.status(400).json({ erro: 'Horário inválido. Use o formato HH:MM.' });
    }

    const treino = await TreinoModel.criar({
      data,
      horario,
      local,
      tipo,
      descricao,
      paceEsperado,
      criadorId: req.usuario.id,
    });

    return res.status(201).json({
      mensagem: 'Treino criado com sucesso.',
      treino: {
        id: treino.id,
        data: treino.data,
        horario: treino.horario,
        local: treino.local,
        tipo: treino.tipo,
        descricao: treino.descricao,
        paceEsperado: treino.paceEsperado,
        criadorId: treino.criadorId,
        status: treino.status,
        totalParticipantes: 1,
        participando: true,
      },
    });
  },

  /**
   * GET /treinos
   * Lista todos os treinos ativos com dados resumidos.
   */
  async listar(req, res) {
    const ativos = await TreinoModel.listarAtivosParaUsuario(req.usuario.id);
    const treinos = ativos.map((t) => ({
      id: t.id,
      data: t.data,
      horario: t.horario,
      local: t.local,
      tipo: t.tipo,
      descricao: t.descricao,
      paceEsperado: t.paceEsperado,
      status: t.status,
      criadorId: t.criadorId,
      criador: { id: t.criadorId, nome: t.criadorNome },
      totalParticipantes: t.totalParticipantes,
      participando: t.participando,
    }));
    return res.json({ total: treinos.length, treinos });
  },

  /**
   * GET /treinos/:id
   * Retorna os detalhes completos de um treino.
   */
  async buscarPorId(req, res) {
    const treino = await TreinoModel.buscarPorIdComUsuario(req.params.id, req.usuario.id);
    if (!treino) return res.status(404).json({ erro: 'Treino não encontrado.' });
    return res.json({
      id: treino.id,
      data: treino.data,
      horario: treino.horario,
      local: treino.local,
      tipo: treino.tipo,
      descricao: treino.descricao,
      paceEsperado: treino.paceEsperado,
      status: treino.status,
      criadorId: treino.criadorId,
      criador: { id: treino.criadorId, nome: treino.criadorNome },
      totalParticipantes: treino.totalParticipantes,
      participando: treino.participando,
    });
  },

  /**
   * DELETE /treinos/:id
   * Cancela um treino. Apenas o criador pode realizar esta ação.
   */
  async atualizar(req, res) {
    const { data, horario, local, tipo, descricao, paceEsperado } = req.body;
    const treino = await TreinoModel.buscarPorIdComUsuario(req.params.id, req.usuario.id);
    if (!treino) return res.status(404).json({ erro: 'Treino não encontrado.' });

    if (treino.criadorId !== req.usuario.id) return res.status(403).json({ erro: 'Apenas o criador pode atualizar este treino.' });

    if (treino.status === TreinoModel.STATUS.CANCELADO) return res.status(409).json({ erro: 'Não é possível atualizar um treino cancelado.' });

    if (!data || !horario || !local || !tipo) {
      return res.status(400).json({ erro: 'Os campos data, horario, local e tipo são obrigatórios.' });
    }

    if (!TreinoModel.TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ erro: `Tipo de treino inválido. Valores aceitos: ${TreinoModel.TIPOS_VALIDOS.join(', ')}.` });
    }

    const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
    if (!REGEX_DATA.test(data)) {
      return res.status(400).json({ erro: 'Data inválida. Use o formato AAAA-MM-DD.' });
    }

    const REGEX_HORARIO = /^\d{2}:\d{2}$/;
    if (!REGEX_HORARIO.test(horario)) {
      return res.status(400).json({ erro: 'Horário inválido. Use o formato HH:MM.' });
    }

    const atualizado = await TreinoModel.atualizar(req.params.id, {
      data,
      horario,
      local,
      tipo,
      descricao,
      paceEsperado,
    });

    if (!atualizado) return res.status(404).json({ erro: 'Treino não encontrado.' });

    return res.json({ mensagem: 'Treino atualizado com sucesso.', treino: atualizado });
  },

  async cancelar(req, res) {
    const treino = await TreinoModel.buscarPorIdComUsuario(req.params.id, req.usuario.id);
    if (!treino) return res.status(404).json({ erro: 'Treino não encontrado.' });

    if (treino.criadorId !== req.usuario.id) return res.status(403).json({ erro: 'Apenas o criador pode cancelar este treino.' });

    if (treino.status === TreinoModel.STATUS.CANCELADO) return res.status(409).json({ erro: 'Este treino já foi cancelado.' });

    const atualizado = await TreinoModel.cancelar(treino.id);
    return res.json({ mensagem: 'Treino cancelado com sucesso.', treino: atualizado });
  },
};

module.exports = treinoController;
