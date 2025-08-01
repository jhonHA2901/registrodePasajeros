// Importar dependencias
const express = require('express');
const cors = require('cors');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { testConnection } = require('./db');
const { initializeDatabase } = require('./initDb');

// Importar rutas
const authRoutes = require('./routes/auth');
const rutasRoutes = require('./routes/rutas');
const registrosRoutes = require('./routes/registros');

// Configuración del servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configuración de CORS para permitir solicitudes desde cualquier origen en desarrollo local
app.use(cors({
  origin: true, // Permitir cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
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
    // Verificar si estamos en Render
    const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
    
    // La verificación de la conexión a la base de datos se realiza más adelante con testConnection()
    
    // Mostrar variables de entorno (sin mostrar contraseñas)
    console.log('Variables de entorno de conexión a la base de datos: ');
    console.log(`- DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`- DB_USER: ${process.env.DB_USER || 'root'}`);
    console.log(`- DB_NAME: ${process.env.DB_NAME || 'registro_pasajeros'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- RENDER_EXTERNAL_URL: ${process.env.RENDER_EXTERNAL_URL || 'no definido'}`);
    
    // Intentar inicializar la base de datos
    console.log('Intentando inicializar la base de datos...');
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente');
    
    // Probar conexión a la base de datos
    console.log('Probando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      // Usar 0.0.0.0 para escuchar en todas las interfaces
      const HOST = '0.0.0.0';
      app.listen(PORT, HOST, () => {
        console.log(`Servidor corriendo en http://${isRender ? process.env.RENDER_EXTERNAL_URL : HOST + ':' + PORT}`);
      });
    } else {
      const errorMsg = 'No se pudo iniciar el servidor debido a problemas con la base de datos';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('Error crítico en entorno de producción. Revisar configuración de Render.');
      console.error('Detalles del error:');
      console.error('- Si el error menciona "localhost", verifica que DB_HOST no esté configurado como localhost en Render');
      console.error('- Verifica que el servicio de base de datos esté correctamente configurado en render.yaml');
      console.error('- Asegúrate de que las variables de entorno estén correctamente configuradas en Render');
    }
    // Salir con código de error para que el contenedor pueda reiniciarse
    process.exit(1);
  }
}

startServer();

module.exports = app; // Para pruebas