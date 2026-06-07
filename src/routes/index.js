const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authRoutes = require('./auth');
const treinosRoutes = require('./treinos');

router.get('/', homeController.index);
router.get('/health', homeController.health);

router.use('/auth', authRoutes);
router.use('/treinos', treinosRoutes);

module.exports = router;
