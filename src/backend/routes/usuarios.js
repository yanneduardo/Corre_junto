const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { autenticar } = require('../middlewares/auth');

// Rota para obter estatísticas de treinos
router.get('/:id/training-stats', autenticar, usuarioController.obterEstatisticasTreinos);

module.exports = router;
