const bcrypt = require('bcrypt');
const { pool } = require('../db');

// Función para registrar un nuevo usuario (pasajero)
async function registrarUsuario(req, res) {
  const { nombre, dni, correo, contraseña } = req.body;

  // Validar datos
  if (!nombre || !dni || !correo || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el DNI ya existe
    const [existingUsers] = await pool.query('SELECT * FROM usuarios WHERE dni = ?', [dni]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, dni, correo, contraseña, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, dni, correo, hashedPassword, 'pasajero']
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

// Función para iniciar sesión
async function login(req, res) {
  const { dni, contraseña } = req.body;

  // Validar datos
  if (!dni || !contraseña) {
    return res.status(400).json({ error: 'DNI y contraseña son obligatorios' });
  }

  try {
    // Buscar usuario por DNI
    const [users] = await pool.query('SELECT * FROM usuarios WHERE dni = ?', [dni]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Responder con datos del usuario (sin la contraseña)
    const { contraseña: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

module.exports = {
  registrarUsuario,
  login
};