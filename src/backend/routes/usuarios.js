const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { autenticar } = require('../middlewares/auth');

// Rota para obter estatísticas de treinos (protegida)
router.get('/:id/training-stats', autenticar, usuarioController.obterEstatisticasTreinos);

// Rota para obter perfil público (sem autenticação)
router.get('/:id/public-profile', usuarioController.obterPerfilPublico);

module.exports = router;
