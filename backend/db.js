const { Pool } = require('pg');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Verificar si estamos en Render
const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
console.log(`Entorno detectado en db.js: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',  // Contraseña para PostgreSQL
  database: process.env.DB_NAME || 'registro_pasajeros',
  port: process.env.DB_PORT || 5432,  // Puerto por defecto de PostgreSQL
  max: 10, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo que una conexión puede estar inactiva
  connectionTimeoutMillis: 60000, // 60 segundos de timeout para la conexión
  ssl: isRender ? { rejectUnauthorized: false } : false // Habilitar SSL en Render
});

// Función para probar la conexión
async function testConnection() {
  let retries = 5;
  let connected = false;
  
  while (retries > 0 && !connected) {
    try {
      console.log(`Intentando conectar a la base de datos PostgreSQL (${6-retries}/5)...`);
      const client = await pool.connect();
      console.log('Conexión a la base de datos PostgreSQL establecida correctamente');
      client.release();
      connected = true;
      return true;
    } catch (error) {
      console.error(`Intento ${6-retries}/5 fallido: ${error.message}`);
      retries--;
      if (retries > 0) {
        console.log(`Reintentando en 5 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de reintentar
      }
    }
  }
  
  if (!connected) {
    console.error('Error al conectar a la base de datos PostgreSQL después de varios intentos');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};