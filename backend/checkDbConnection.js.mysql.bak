/**
 * Script para verificar la conexión a la base de datos en Render
 * Ejecutar con: node checkDbConnection.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkConnection() {
  console.log('=== VERIFICADOR DE CONEXIÓN A BASE DE DATOS ===');
  console.log('Entorno detectado:', process.env.NODE_ENV || 'development');
  console.log('Variables de entorno:');
  console.log(`- DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`- DB_USER: ${process.env.DB_USER || 'root'}`);
  console.log(`- DB_NAME: ${process.env.DB_NAME || 'registro_pasajeros'}`);
  console.log(`- RENDER_EXTERNAL_URL: ${process.env.RENDER_EXTERNAL_URL || 'no definido'}`);
  
  // Configuración de conexión
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'registro_pasajeros',
    connectTimeout: 30000, // 30 segundos
  };
  
  console.log('\nIntentando conectar a MySQL...');
  console.log(`Host: ${config.host}, Usuario: ${config.user}, Base de datos: ${config.database}`);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('\n✅ CONEXIÓN EXITOSA');
    
    // Verificar que podemos ejecutar consultas
    console.log('\nVerificando consulta simple...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Resultado de consulta:', rows);
    
    await connection.end();
    console.log('\nConexión cerrada correctamente');
    return true;
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN');
    console.error(`Mensaje: ${error.message}`);
    console.error(`Código: ${error.code}`);
    console.error(`Stack: ${error.stack}`);
    return false;
  }
}

// Ejecutar la verificación
checkConnection()
  .then(success => {
    console.log('\n=== RESULTADO FINAL ===');
    if (success) {
      console.log('La conexión a la base de datos funciona correctamente.');
      process.exit(0);
    } else {
      console.log('No se pudo conectar a la base de datos. Revise los errores anteriores.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error inesperado:', err);
    process.exit(1);
  });