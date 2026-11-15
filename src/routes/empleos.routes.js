const express = require('express');
const asyncHandler = require('../utils/async-handler');
const controller = require('../controllers/empleos.controller');

const router = express.Router();

router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));
router.post('/', asyncHandler(controller.crear));
router.put('/:id', asyncHandler(controller.actualizar));
router.delete('/:id', asyncHandler(controller.eliminar));

module.exports = router;