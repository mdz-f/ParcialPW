/**
 * Ruta para subir archivos CV (sin multer).
 * Recibe el archivo como base64 en JSON: { nombre, base64 }
 * Guarda en /public/uploads/cvs/ y devuelve la URL pública.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'cvs');

router.post('/', requireAuth(['candidato', 'empresa', 'admin']), asyncHandler(async (req, res) => {
  const { nombre, base64 } = req.body || {};
  if (!nombre || !base64) {
    return res.status(400).json({ ok: false, error: 'Nombre y contenido base64 del archivo son obligatorios' });
  }

  // Validar extensión
  if (!/\.(pdf|docx?)$/i.test(nombre)) {
    return res.status(400).json({ ok: false, error: 'Solo se permiten archivos PDF o DOCX' });
  }

  // Generar nombre único: timestamp_nombre-original
  const seguro = nombre.replace(/[^a-zA-Z0-9._-]/g, '_');
  const nombreFinal = `${Date.now()}_${seguro}`;
  const rutaArchivo = path.join(UPLOADS_DIR, nombreFinal);

  // Decodificar base64 y guardar
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(rutaArchivo, buffer);

  const urlPublica = `/uploads/cvs/${nombreFinal}`;
  res.status(201).json({ ok: true, url: urlPublica, nombre: nombreFinal });
}));

module.exports = router;
