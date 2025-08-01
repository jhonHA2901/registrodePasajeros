const { pool } = require('./db'); // Importamos el pool ya configurado
const fs = require('fs');
const path = require('path');

// Leer el archivo SQL
const sqlFilePath = path.join(__dirname, '..', 'sql', 'base_datos.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// Dividir el script en comandos individuales
const sqlCommands = sqlScript
  .replace(/\r\n/g, '\n')
  .split(';\n')
  .filter(command => command.trim() !== '' && !command.trim().toLowerCase().startsWith('create database') && !command.trim().toLowerCase().startsWith('\\c'));

async function initializeDatabase() {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log(`(${6 - retries}/5) Intentando conectar a la base de datos para inicialización...`);
      await tryInitialize();
      console.log('>>> Base de datos inicializada con éxito.');
      return true; // Salir si la inicialización es exitosa
    } catch (error) {
      retries--;
      console.error(`Error en el intento de inicialización: ${error.message}`);
      if (retries > 0) {
        console.log(`Reintentando en 5 segundos...`);
        await new Promise(res => setTimeout(res, 5000));
      } else {
        console.error('No se pudo inicializar la base de datos después de varios intentos.');
        throw new Error('No se pudo conectar a la base de datos para la inicialización.');
      }
    }
  }
}

async function tryInitialize() {
  let client;
  try {
    client = await pool.connect();
    console.log('Conexión establecida. Ejecutando scripts SQL...');
    for (const command of sqlCommands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand) {
        try {
          await client.query(trimmedCommand + ';');
        } catch (cmdError) {
          if (cmdError.code !== '42P07') { // Ignorar si la tabla ya existe
            console.warn(`Advertencia en comando SQL: ${cmdError.message}`);
          }
        }
      }
    }
  } finally {
    if (client) {
      client.release();
    }
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