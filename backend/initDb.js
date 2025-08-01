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
  // Configuración para conectar sin especificar una base de datos
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    multipleStatements: true
  };

  let connection;

  try {
    // Conectar a MySQL sin especificar una base de datos
    connection = await mysql.createConnection(config);
    console.log('Conectado a MySQL');

    // Ejecutar cada comando SQL
    for (const command of sqlCommands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand) {
        await connection.query(trimmedCommand + ';');
        console.log(`Comando ejecutado: ${trimmedCommand.substring(0, 50)}...`);
      }
    }

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
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