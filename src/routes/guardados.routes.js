const express = require('express');
const asyncHandler = require('../utils/async-handler');
const controller = require('../controllers/guardados.controller');

const router = express.Router();

router.get('/:usuarioId', asyncHandler(controller.listar));
router.post('/', asyncHandler(controller.toggle));
router.delete('/:usuarioId/:empleoId', asyncHandler(controller.quitar));

module.exports = router;
