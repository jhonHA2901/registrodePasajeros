const { Pool } = require('pg');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Verificar si estamos en Render
const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
console.log(`Entorno detectado en db.js: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 

// Configuración de la conexión a la base de datos PostgreSQL
const poolConfig = isRender
  ? {
      // Configuración para Render (producción)
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Requerido por Render
    }
  : {
      // Configuración para desarrollo (local)
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'registro_pasajeros',
      port: process.env.DB_PORT || 5432
    };

const pool = new Pool(poolConfig);

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