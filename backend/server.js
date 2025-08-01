const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./db');
const { initializeDatabase } = require('./initDb');

// Importar rutas
const authRoutes = require('./routes/auth');
const rutasRoutes = require('./routes/rutas');
const registrosRoutes = require('./routes/registros');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', authRoutes);
app.use('/api', rutasRoutes);
app.use('/api', registrosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Registro de Pasajeros funcionando correctamente' });
});

// Iniciar servidor
async function startServer() {
  try {
    // Mostrar variables de entorno (sin mostrar contraseñas)
    console.log('Variables de entorno de conexión a la base de datos:');
    console.log(`- DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`- DB_USER: ${process.env.DB_USER || 'root'}`);
    console.log(`- DB_NAME: ${process.env.DB_NAME || 'registro_pasajeros'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    
    // Intentar inicializar la base de datos
    console.log('Intentando inicializar la base de datos...');
    try {
      await initializeDatabase();
      console.log('Base de datos inicializada correctamente');
    } catch (dbInitError) {
      console.error('Error al inicializar la base de datos:', dbInitError);
      throw dbInitError; // Propagar el error para detener el inicio del servidor
    }
    
    // Probar conexión a la base de datos
    console.log('Probando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://${process.env.NODE_ENV === 'production' ? 'tu-app.onrender.com' : '0.0.0.0'}:${PORT}`);
      });
    } else {
      const errorMsg = 'No se pudo iniciar el servidor debido a problemas con la base de datos';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    // En producción, podríamos querer reintentar o notificar a un sistema de monitoreo
    if (process.env.NODE_ENV === 'production') {
      console.error('Error crítico en entorno de producción. Revisar configuración de Render.');
    }
    // Salir con código de error para que el contenedor pueda reiniciarse
    process.exit(1);
  }
}

startServer();

module.exports = app; // Para pruebas