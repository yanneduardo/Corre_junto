const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir as fotos de perfil enviadas pelos usuários
app.use('/uploads/profile-pictures', express.static(path.join(__dirname, 'uploads/profile-pictures')));

const routes = require('./routes');
app.use('/', routes);

module.exports = app;
