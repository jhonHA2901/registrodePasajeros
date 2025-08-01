const { pool } = require('../db');

// Registrar una ruta para un pasajero
async function registrarRuta(req, res) {
  const { usuario_id, ruta_id } = req.body;
  const fecha_registro = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

  // Validar datos
  if (!usuario_id || !ruta_id) {
    return res.status(400).json({ error: 'ID de usuario y ruta son obligatorios' });
  }

  try {
    // Verificar que el usuario existe
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que la ruta existe
    const [rutas] = await pool.query('SELECT * FROM rutas WHERE id = ?', [ruta_id]);
    if (rutas.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    // Insertar registro
    const [result] = await pool.query(
      'INSERT INTO registros (usuario_id, ruta_id, fecha_registro) VALUES (?, ?, ?)',
      [usuario_id, ruta_id, fecha_registro]
    );

    res.status(201).json({
      message: 'Ruta registrada correctamente',
      registroId: result.insertId
    });
  } catch (error) {
    console.error('Error al registrar ruta:', error);
    res.status(500).json({ error: 'Error al registrar ruta' });
  }
}

// Obtener historial de rutas de un usuario
async function obtenerHistorialUsuario(req, res) {
  const { id_usuario } = req.params;

  try {
    // Verificar que el usuario existe
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id_usuario]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener historial con información de las rutas
    const [historial] = await pool.query(
      `SELECT r.id, r.fecha_registro, ru.origen, ru.destino 
       FROM registros r 
       JOIN rutas ru ON r.ruta_id = ru.id 
       WHERE r.usuario_id = ? 
       ORDER BY r.fecha_registro DESC`,
      [id_usuario]
    );

    res.status(200).json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}

// Obtener todos los registros (solo admin)
async function obtenerTodosRegistros(req, res) {
  const { rol } = req.user || {}; // Asumiendo que el middleware de autenticación agrega el usuario a req

  // Verificar si es admin
  if (rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  try {
    // Obtener todos los registros con información de usuarios y rutas
    const [registros] = await pool.query(
      `SELECT r.id, r.fecha_registro, 
              u.id as usuario_id, u.nombre as nombre_usuario, u.dni, 
              ru.id as ruta_id, ru.origen, ru.destino 
       FROM registros r 
       JOIN usuarios u ON r.usuario_id = u.id 
       JOIN rutas ru ON r.ruta_id = ru.id 
       ORDER BY r.fecha_registro DESC`
    );

    res.status(200).json(registros);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).json({ error: 'Error al obtener registros' });
  }
}

module.exports = {
  registrarRuta,
  obtenerHistorialUsuario,
  obtenerTodosRegistros
};