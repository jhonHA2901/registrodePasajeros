const express = require('express');
const cors = require('cors');
const { testConnection } = require('./db');

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
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://192.168.2.42:${PORT}`);
      });
    } else {
      console.error('No se pudo iniciar el servidor debido a problemas con la base de datos');
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
}

startServer();

module.exports = app; // Para pruebas