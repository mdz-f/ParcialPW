const express = require('express');
const asyncHandler = require('../utils/async-handler');
const controller = require('../controllers/empleos.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Lectura pública
router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));

// Escritura: solo empresa o admin pueden crear/actualizar; solo admin puede eliminar
router.post('/', requireAuth(['empresa', 'admin']), asyncHandler(controller.crear));
router.put('/:id', requireAuth(['empresa', 'admin']), asyncHandler(controller.actualizar));
router.delete('/:id', requireAuth(['admin']), asyncHandler(controller.eliminar));

module.exports = router;
