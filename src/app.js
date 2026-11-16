const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/empleos', require('./routes/empleos.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/postulaciones', require('./routes/postulaciones.routes'));

// Endpoint para el asistente inteligente Chambita AI
app.post('/api/chat', (req, res) => {
  const { mensaje } = req.body || {};
  const query = String(mensaje || '').toLowerCase();

  let respuesta = '¡Hola! Soy **Chambita**, tu copiloto de empleo en El Salvador. Puedo ayudarte a buscar ofertas, optimizar tu currículum o publicar vacantes para tu empresa. ¿En qué te oriento?';

  if (query.includes('cv') || query.includes('curriculum') || query.includes('currículum')) {
    respuesta = '📄 <b>Consejos para tu CV:</b> Enfócate en logros cuantificables, usa verbos de acción y adapta tus habilidades al puesto deseado. Encuentra guías y plantillas en el <a href="recursos.html" class="fw-semibold text-primary">Centro de Recursos</a>.';
  } else if (query.includes('remoto') || query.includes('teletrabajo') || query.includes('casa')) {
    respuesta = '💻 <b>Vacantes remotas:</b> Disponemos de oportunidades para trabajar desde casa en tecnología, diseño, atención al cliente y finanzas. Explóralas en <a href="empleos.html" class="fw-semibold text-primary">Buscar Empleos</a> activando el filtro <i>"Remoto"</i>.';
  } else if (query.includes('empresa') || query.includes('publicar') || query.includes('contratar')) {
    respuesta = '🏢 <b>Para empresas:</b> Puedes dar de alta tu empresa y publicar vacantes de forma inmediata desde el <a href="empresa.html" class="fw-semibold text-primary">Módulo Empresarial</a>.';
  } else if (query.includes('salario') || query.includes('sueldo') || query.includes('pago')) {
    respuesta = '💵 <b>Salarios transparentes:</b> Todas las vacantes en ChambeaSV incluyen un rango salarial visible en USD para darte claridad desde tu primera postulación.';
  }

  res.json({ ok: true, respuesta });
});

module.exports = app;