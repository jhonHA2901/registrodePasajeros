const { pool } = require('../db');

// Obtener todas las rutas
async function obtenerRutas(req, res) {
  try {
    const [rutas] = await pool.query('SELECT * FROM rutas');
    res.status(200).json(rutas);
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
}

// Agregar una nueva ruta (solo admin)
async function agregarRuta(req, res) {
  const { origen, destino } = req.body;
  const { rol } = req.user || {}; // Asumiendo que el middleware de autenticación agrega el usuario a req

  // Validar datos
  if (!origen || !destino) {
    return res.status(400).json({ error: 'Origen y destino son obligatorios' });
  }

  // Verificar si es admin
  if (rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  try {
    // Insertar nueva ruta
    const [result] = await pool.query(
      'INSERT INTO rutas (origen, destino) VALUES (?, ?)',
      [origen, destino]
    );

    res.status(201).json({
      message: 'Ruta agregada correctamente',
      rutaId: result.insertId,
      ruta: { id: result.insertId, origen, destino }
    });
  } catch (error) {
    console.error('Error al agregar ruta:', error);
    res.status(500).json({ error: 'Error al agregar ruta' });
  }
}

// Obtener una ruta específica por ID
async function obtenerRutaPorId(req, res) {
  const { id } = req.params;

  try {
    const [rutas] = await pool.query('SELECT * FROM rutas WHERE id = ?', [id]);
    
    if (rutas.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    res.status(200).json(rutas[0]);
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    res.status(500).json({ error: 'Error al obtener ruta' });
  }
}

module.exports = {
  obtenerRutas,
  agregarRuta,
  obtenerRutaPorId
};