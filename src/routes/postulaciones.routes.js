const express = require('express');
const asyncHandler = require('../utils/async-handler');
const controller = require('../controllers/postulaciones.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Lectura pública (admin y empresa consultan sus postulaciones)
router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));

// Crear postulación: cualquier usuario autenticado
router.post('/', requireAuth(['candidato', 'empresa', 'admin']), asyncHandler(controller.crear));
// Actualizar estado (aceptar/rechazar): empresa o admin
router.put('/:id', requireAuth(['empresa', 'admin']), asyncHandler(controller.actualizar));
// Eliminar: solo admin
router.delete('/:id', requireAuth(['admin']), asyncHandler(controller.eliminar));

module.exports = router;
