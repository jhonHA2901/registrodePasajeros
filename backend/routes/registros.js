const express = require('express');
const router = express.Router();
const { registrarRuta, obtenerHistorialUsuario, obtenerTodosRegistros } = require('../controllers/registroController');

// Middleware para verificar autenticación (simulado)
const verificarAuth = (req, res, next) => {
  // En una implementación real, aquí verificaríamos un token JWT
  // Por ahora, simplemente pasamos el rol en el cuerpo de la solicitud para pruebas
  const { rol } = req.body;
  if (rol) {
    req.user = { rol };
  }
  next();
};

// Registrar una ruta para un pasajero
router.post('/registrar', registrarRuta);

// Obtener historial de rutas de un usuario
router.get('/historial/:id_usuario', obtenerHistorialUsuario);

// Obtener todos los registros (solo admin)
router.get('/registros', verificarAuth, obtenerTodosRegistros);

module.exports = router;