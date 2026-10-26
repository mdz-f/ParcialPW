/**
 * ============================================================
 *  TalentoLink - Servidor del prototipo
 * ============================================================
 *  Servidor Express mínimo que solo entrega los archivos
 *  estáticos (HTML, CSS, JS) de la carpeta /public.
 *
 *  En esta fase de PROTOTIPO no hay base de datos: toda la
 *  información se simula en /public/js/data.js y se guarda en
 *  el localStorage del navegador.
 *
 *  En la siguiente fase aquí se agregarán las rutas de la API
 *  (ej. GET /api/empleos, POST /api/postulaciones) conectadas
 *  a PostgreSQL.
 * ============================================================
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir todos los archivos de /public (index.html es la página de inicio)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de ejemplo para la futura API (demuestra que el backend responde)
app.get('/api/estado', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor del prototipo TalentoLink funcionando' });
});

// Cualquier ruta desconocida regresa a la página de inicio
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ TalentoLink corriendo en http://localhost:${PORT}`);
});
