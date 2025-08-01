/**
 * Script para verificar la conexión a la base de datos PostgreSQL en Render
 * Ejecutar con: node checkDbConnection.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkConnection() {
  console.log('=== VERIFICADOR DE CONEXIÓN A BASE DE DATOS POSTGRESQL ===');
  console.log('Entorno detectado:', process.env.NODE_ENV || 'development');
  console.log('Variables de entorno:');
  console.log(`- DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`- DB_USER: ${process.env.DB_USER || 'postgres'}`);
  console.log(`- DB_NAME: ${process.env.DB_NAME || 'registro_pasajeros'}`);
  console.log(`- DB_PORT: ${process.env.DB_PORT || '5432'}`);
  console.log(`- RENDER_EXTERNAL_URL: ${process.env.RENDER_EXTERNAL_URL || 'no definido'}`);
  
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  
  // Configuración de conexión
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'registro_pasajeros',
    port: process.env.DB_PORT || 5432,
    connectionTimeoutMillis: 30000, // 30 segundos
    ssl: isRender ? { rejectUnauthorized: false } : false // Habilitar SSL en Render
  };
  
  console.log('\nIntentando conectar a PostgreSQL...');
  console.log(`Host: ${config.host}, Usuario: ${config.user}, Base de datos: ${config.database}, Puerto: ${config.port}`);
  console.log(`SSL: ${isRender ? 'Habilitado' : 'Deshabilitado'}`);
  
  const pool = new Pool(config);
  let client;
  
  try {
    client = await pool.connect();
    console.log('\n✅ CONEXIÓN EXITOSA');
    
    // Verificar que podemos ejecutar consultas
    console.log('\nVerificando consulta simple...');
    const result = await client.query('SELECT 1 as test');
    console.log('Resultado de consulta:', result.rows);
    
    // Verificar tablas existentes
    console.log('\nVerificando tablas existentes...');
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tables.rows.length === 0) {
      console.log('No se encontraron tablas en la base de datos');
    } else {
      console.log('Tablas encontradas:');
      tables.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    client.release();
    await pool.end();
    console.log('\nConexión cerrada correctamente');
    return true;
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN');
    console.error(`Mensaje: ${error.message}`);
    console.error(`Código: ${error.code}`);
    console.error(`Stack: ${error.stack}`);
    
    if (client) client.release();
    if (pool) await pool.end();
    
    // Sugerencias específicas para PostgreSQL
    console.error('\nPosibles soluciones:');
    if (isRender) {
      console.error('1. Verifica que el servicio de base de datos PostgreSQL esté correctamente configurado en render.yaml');
      console.error('2. Asegúrate de que las variables de entorno estén correctamente configuradas en Render');
      console.error('3. Verifica que la base de datos PostgreSQL esté creada y en ejecución');
    } else {
      console.error('1. Verifica que PostgreSQL esté instalado y en ejecución');
      console.error('2. Comprueba las credenciales en el archivo .env');
      console.error('3. Asegúrate de que la base de datos esté creada');
      console.error('4. Ejecuta: createdb registro_pasajeros (si la base de datos no existe)');
    }
    
    return false;
  }
}

// Si se ejecuta directamente este archivo
if (require.main === module) {
  checkConnection().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}

module.exports = { checkConnection };