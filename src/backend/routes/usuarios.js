const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { autenticar } = require('../middlewares/auth');
const { processarUploadFoto } = require('../middlewares/upload');

// Rota para obter dados públicos do perfil
router.get('/:id', autenticar, usuarioController.buscarPerfil);

// Rota para editar biografia e nível de corrida
router.put('/:id/bio', autenticar, usuarioController.atualizarBio);

// Rota para obter estatísticas de treinos
router.get('/:id/training-stats', autenticar, usuarioController.obterEstatisticasTreinos);

// Rotas para gerenciar a foto de perfil
router.post('/:id/profile-picture', autenticar, processarUploadFoto, usuarioController.uploadFotoPerfil);
router.delete('/:id/profile-picture', autenticar, usuarioController.removerFotoPerfil);

module.exports = router;
