const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const routes = require('./routes');
app.use('/', routes);

module.exports = app;
