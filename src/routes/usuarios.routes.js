const express = require('express');
const asyncHandler = require('../utils/async-handler');
const controller = require('../controllers/usuarios.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Endpoints públicos de autenticación
router.post('/login', asyncHandler(controller.login));
router.post('/registro', asyncHandler(controller.registro));

// Lectura: cualquier autenticado puede ver el listado/perfil
router.get('/', requireAuth(['admin']), asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));

// Crear usuario (vía admin): solo admin
router.post('/', requireAuth(['admin']), asyncHandler(controller.crear));

// Actualizar perfil propio o por admin
router.put('/:id', requireAuth(['candidato', 'empresa', 'admin']), asyncHandler(controller.actualizar));

// Eliminar: solo admin
router.delete('/:id', requireAuth(['admin']), asyncHandler(controller.eliminar));

module.exports = router;
