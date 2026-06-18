const express = require('express');
const router = express.Router();
const treinoController = require('../controllers/treinoController');
const { autenticar } = require('../middlewares/auth');

router.post('/', autenticar, treinoController.criar);
router.get('/', autenticar, treinoController.listar);
router.get('/:id', autenticar, treinoController.buscarPorId);
router.patch('/:id', autenticar, treinoController.atualizar);
router.put('/:id', autenticar, treinoController.atualizar);
router.delete('/:id', autenticar, treinoController.cancelar);

module.exports = router;
