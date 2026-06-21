const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { autenticar } = require('../middlewares/auth');

// Rota para obter dados públicos do perfil
router.get('/:id', autenticar, usuarioController.buscarPerfil);

// Rota para editar biografia e nível de corrida
router.put('/:id/bio', autenticar, usuarioController.atualizarBio);

// Rota para obter estatísticas de treinos
router.get('/:id/training-stats', autenticar, usuarioController.obterEstatisticasTreinos);

module.exports = router;
