const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/auth');

router.post('/cadastro', authController.cadastro);
router.post('/login', authController.login);
router.get('/me', autenticar, authController.me);

module.exports = router;
