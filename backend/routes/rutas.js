const express = require('express');
const router = express.Router();
const { obtenerRutas, agregarRuta, obtenerRutaPorId } = require('../controllers/rutaController');

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

// Obtener todas las rutas
router.get('/rutas', obtenerRutas);

// Obtener una ruta específica
router.get('/rutas/:id', obtenerRutaPorId);

// Agregar una nueva ruta (solo admin)
router.post('/rutas', verificarAuth, agregarRuta);

module.exports = router;