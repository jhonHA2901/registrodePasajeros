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
  console.log('Iniciando la inicialización de la base de datos...');
  let client;
  try {
    // Usamos el pool importado de db.js que ya tiene la configuración correcta
    client = await pool.connect();
    console.log('Conexión a la base de datos establecida para inicialización.');

    // Ejecutar cada comando SQL del script
    for (const command of sqlCommands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand) {
        try {
          await client.query(trimmedCommand + ';');
          console.log(`Comando ejecutado: ${trimmedCommand.substring(0, 60)}...`);
        } catch (cmdError) {
          // Ignorar errores de 'tabla ya existe' para que el script sea re-ejecutable
          if (cmdError.code === '42P07') { // 'duplicate_table'
            console.log(`Tabla ya existe, omitiendo comando: ${trimmedCommand.substring(0, 60)}...`);
          } else {
            console.warn(`Advertencia al ejecutar comando: ${cmdError.message}`);
          }
        }
      }
    }

    console.log('Base de datos inicializada correctamente.');
    return true;
  } catch (error) {
    console.error('Error fatal durante la inicialización de la base de datos:', error.message);
    // No reintentamos aquí, dejamos que el test de conexión de server.js lo maneje
    throw new Error('No se pudo conectar a la base de datos para la inicialización.');
  } finally {
    if (client) {
      client.release();
      console.log('Cliente de inicialización liberado.');
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