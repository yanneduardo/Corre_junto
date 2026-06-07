const TreinoModel = require('../models/treino');
const UsuarioModel = require('../models/usuario');

const treinoController = {
  /**
   * POST /treinos
   * Cria um novo treino em grupo.
   */
  criar(req, res) {
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

    const treino = TreinoModel.criar({
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
      treino: _enriquecerTreino(treino),
    });
  },

  /**
   * GET /treinos
   * Lista todos os treinos ativos com dados resumidos.
   */
  listar(req, res) {
    const ativos = TreinoModel.listarAtivos();
    return res.json({
      total: ativos.length,
      treinos: ativos.map(_enriquecerTreino),
    });
  },

  /**
   * GET /treinos/:id
   * Retorna os detalhes completos de um treino.
   */
  buscarPorId(req, res) {
    const treino = TreinoModel.buscarPorId(req.params.id);
    if (!treino) {
      return res.status(404).json({ erro: 'Treino não encontrado.' });
    }
    return res.json(_enriquecerTreino(treino));
  },

  /**
   * DELETE /treinos/:id
   * Cancela um treino. Apenas o criador pode realizar esta ação.
   */
  cancelar(req, res) {
    const treino = TreinoModel.buscarPorId(req.params.id);
    if (!treino) {
      return res.status(404).json({ erro: 'Treino não encontrado.' });
    }

    if (treino.criadorId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Apenas o criador pode cancelar este treino.' });
    }

    if (treino.status === TreinoModel.STATUS.CANCELADO) {
      return res.status(409).json({ erro: 'Este treino já foi cancelado.' });
    }

    const atualizado = TreinoModel.cancelar(treino.id);
    return res.json({ mensagem: 'Treino cancelado com sucesso.', treino: atualizado });
  },
};

/**
 * Adiciona o nome do criador ao objeto treino para a resposta.
 */
function _enriquecerTreino(treino) {
  const criador = UsuarioModel.buscarPorId(treino.criadorId);
  return {
    ...treino,
    criador: criador ? { id: criador.id, nome: criador.nome } : null,
    totalParticipantes: treino.participantes.length,
  };
}

module.exports = treinoController;
