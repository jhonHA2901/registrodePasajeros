const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Leer el archivo SQL
const sqlFilePath = path.join(__dirname, '..', 'sql', 'base_datos.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// Dividir el script en comandos individuales
// PostgreSQL usa ';' como terminador de comandos
const sqlCommands = sqlScript
  .replace(/\r\n/g, '\n')
  .split(';\n')
  .filter(command => command.trim() !== '');

async function initializeDatabase() {
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 
  
  // Configuración para conectar a PostgreSQL
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
    // Inicialmente nos conectamos a la base de datos 'postgres' (base de datos por defecto)
    database: 'postgres',
    ssl: isRender ? { rejectUnauthorized: false } : false // Habilitar SSL en Render
  };
  
  // Mostrar información detallada de la conexión
  console.log('Información detallada de la conexión:');
  console.log(`- Entorno: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 
  console.log(`- Host: ${config.host}`); 
  console.log(`- Usuario: ${config.user}`); 
  console.log(`- Puerto: ${config.port}`);
  console.log(`- SSL: ${isRender ? 'Habilitado' : 'Deshabilitado'}`);
  
  console.log(`Intentando conectar a: ${config.host} con usuario: ${config.user}`);

  let pool;
  let client;
  let retries = 5; // Número de intentos de conexión
  let connected = false;

  while (retries > 0 && !connected) {
    try {
      console.log(`Intentando conectar a PostgreSQL (${6-retries}/5)...`);
      // Crear un pool de conexiones
      pool = new Pool(config);
      // Obtener una conexión del pool
      client = await pool.connect();
      connected = true;
      console.log('Conectado a PostgreSQL exitosamente');

      // Primero, intentamos crear la base de datos
      try {
        await client.query('CREATE DATABASE registro_pasajeros;');
        console.log('Base de datos registro_pasajeros creada exitosamente');
      } catch (dbError) {
        // Si la base de datos ya existe, continuamos
        if (dbError.code === '42P04') { // Código de error para base de datos ya existente
          console.log('La base de datos registro_pasajeros ya existe, continuando...');
        } else {
          console.warn(`Advertencia al crear la base de datos: ${dbError.message}`);
        }
      }

      // Cerramos la conexión actual
      client.release();
      await pool.end();

      // Nos conectamos a la base de datos registro_pasajeros
      config.database = 'registro_pasajeros';
      pool = new Pool(config);
      client = await pool.connect();
      console.log('Conectado a la base de datos registro_pasajeros');

      // Ejecutar cada comando SQL excepto el CREATE DATABASE y \c
      for (let i = 2; i < sqlCommands.length; i++) {
        const trimmedCommand = sqlCommands[i].trim();
        if (trimmedCommand) {
          try {
            await client.query(trimmedCommand + ';');
            console.log(`Comando ejecutado: ${trimmedCommand.substring(0, 50)}...`);
          } catch (cmdError) {
            console.warn(`Advertencia al ejecutar comando: ${cmdError.message}`);
          }
        }
      }

      console.log('Base de datos inicializada correctamente');
      return true; // Indicar que la inicialización fue exitosa
    } catch (error) {
      console.error(`Intento ${6-retries}/5 fallido: ${error.message}`);
      retries--;
      if (retries > 0) {
        console.log(`Reintentando en 5 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de reintentar
      }
    } finally {
      if (client) {
        client.release();
      }
      if (pool) {
        await pool.end();
      }
      console.log('Conexión cerrada');
    }
  }
  
  if (!connected) {
    console.error('No se pudo conectar a la base de datos después de varios intentos');
    throw new Error('No se pudo conectar a la base de datos');
  }
}

// Exportar la función para usarla en server.js
module.exports = { initializeDatabase };

// Si se ejecuta directamente este archivo
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Inicialización completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error durante la inicialización:', error);
      process.exit(1);
    });
}