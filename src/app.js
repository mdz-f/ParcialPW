const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/empleos', require('./routes/empleos.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/postulaciones', require('./routes/postulaciones.routes'));

module.exports = app;