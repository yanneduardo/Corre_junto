const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authRoutes = require('./auth');
const treinosRoutes = require('./treinos');
const usuariosRoutes = require('./usuarios');

router.get('/', homeController.index);
router.get('/health', homeController.health);
router.use('/auth', authRoutes);
router.use('/treinos', treinosRoutes);
router.use('/usuarios', usuariosRoutes);

module.exports = router;
