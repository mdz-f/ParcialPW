const express = require('express');
const asyncHandler = require('../utils/async-handler');
const controller = require('../controllers/guardados.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:usuarioId', asyncHandler(controller.listar));
router.post('/', requireAuth(['candidato', 'empresa', 'admin']), asyncHandler(controller.toggle));
router.delete('/:usuarioId/:empleoId', requireAuth(['candidato', 'empresa', 'admin']), asyncHandler(controller.quitar));

module.exports = router;
