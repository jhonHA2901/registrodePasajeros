const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Leer el archivo SQL
const sqlFilePath = path.join(__dirname, '..', 'sql', 'base_datos.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// Dividir el script en comandos individuales
const sqlCommands = sqlScript
  .replace(/\r\n/g, '\n')
  .split(';\n')
  .filter(command => command.trim() !== '');

async function initializeDatabase() {
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`);
  
  // Configuración para conectar sin especificar una base de datos
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    multipleStatements: true,
    connectTimeout: 30000, // 30 segundos de timeout para la conexión
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  
  console.log(`Intentando conectar a: ${config.host} con usuario: ${config.user}`);

  let connection;
  let retries = 5; // Número de intentos de conexión
  let connected = false;

  while (retries > 0 && !connected) {
    try {
      console.log(`Intentando conectar a MySQL (${6-retries}/5)...`);
      // Conectar a MySQL sin especificar una base de datos
      connection = await mysql.createConnection(config);
      connected = true;
      console.log('Conectado a MySQL exitosamente');

      // Ejecutar cada comando SQL
      for (const command of sqlCommands) {
        const trimmedCommand = command.trim();
        if (trimmedCommand) {
          try {
            await connection.query(trimmedCommand + ';');
            console.log(`Comando ejecutado: ${trimmedCommand.substring(0, 50)}...`);
          } catch (cmdError) {
            // Si el error es porque la base de datos ya existe, continuamos
            if (cmdError.code === 'ER_DB_CREATE_EXISTS') {
              console.log('La base de datos ya existe, continuando...');
            } else {
              console.warn(`Advertencia al ejecutar comando: ${cmdError.message}`);
            }
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
      if (connection) {
        await connection.end();
        console.log('Conexión cerrada');
      }
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
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error en la inicialización:', err);
      process.exit(1);
    });
}