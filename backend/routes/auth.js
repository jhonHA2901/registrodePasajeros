const express = require('express');
const router = express.Router();
const { registrarUsuario, login } = require('../controllers/authController');

// Ruta para registrar un nuevo usuario (pasajero)
router.post('/registro', registrarUsuario);

// Ruta para iniciar sesión
router.post('/login', login);

module.exports = router;