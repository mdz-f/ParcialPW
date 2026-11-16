const express = require('express');
const asyncHandler = require('../utils/async-handler');
const controller = require('../controllers/usuarios.controller');

const router = express.Router();

// Endpoints de Autenticación y Registro
router.post('/login', asyncHandler(controller.login));
router.post('/registro', asyncHandler(controller.registro));

// Endpoints CRUD para usuarios
router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));
router.post('/', asyncHandler(controller.crear));
router.put('/:id', asyncHandler(controller.actualizar));
router.delete('/:id', asyncHandler(controller.eliminar));

module.exports = router;