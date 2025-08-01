/**
 * Script para verificar la configuración de la base de datos PostgreSQL en Render
 * Ejecutar con: node checkRenderDb.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function checkRenderDb() {
  console.log('=== VERIFICADOR DE CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL EN RENDER ===');
  
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 
  
  // Verificar variables de entorno críticas
  console.log('\nVerificando variables de entorno de la base de datos:');
  let hasErrors = false;
  
  if (!process.env.DB_HOST) {
    console.log('❌ DB_HOST no está definido. Usando valor por defecto: localhost');
    if (isRender) {
      console.log('⚠️ ERROR CRÍTICO: Usar localhost en Render causará problemas de conexión');
      console.log('   → En Render, DB_HOST debe ser la dirección del servicio de base de datos');
      console.log('   → Verifica en render.yaml que el servicio de base de datos esté correctamente configurado');
      console.log('   → El formato correcto es: ${services.registrop1-db.host}');
      hasErrors = true;
    }
  } else {
    console.log(`✅ DB_HOST: ${process.env.DB_HOST}`);
    if (isRender && (process.env.DB_HOST === 'localhost' || process.env.DB_HOST.includes('127.0.0.1'))) {
      console.log('⚠️ ERROR CRÍTICO: No se debe usar localhost o 127.0.0.1 como DB_HOST en Render');
      console.log('   → En Render, la base de datos debe estar en un servicio separado');
      console.log('   → Verifica que en render.yaml esté configurado correctamente el servicio de base de datos');
      console.log('   → Y que las variables de entorno estén configuradas para usar ese servicio');
      hasErrors = true;
    }
  }
  
  // Verificar si las variables son las esperadas en Render
  if (isRender) {
    console.log('\nVerificación de variables en entorno Render:');
    
    // En Render, DB_HOST no debería ser localhost
    if (process.env.DB_HOST === 'localhost') {
      console.error('❌ ERROR: DB_HOST está configurado como "localhost" en Render');
      console.error('   Esto indica que las variables de entorno de Render no se están aplicando correctamente.');
      console.error('   Verifica la configuración en render.yaml y asegúrate de que las variables se estén pasando desde la base de datos.');
    } else if (process.env.DB_HOST && process.env.DB_HOST.includes('postgres.render.com')) {
      console.log('✅ DB_HOST parece ser una URL válida de Render para PostgreSQL');
    } else {
      console.log(`⚠️ DB_HOST no tiene el formato esperado para Render: ${process.env.DB_HOST}`);
    }
    
    // En Render, DB_USER no debería ser postgres (valor por defecto)
    if (process.env.DB_USER === 'postgres') {
      console.error('❌ ERROR: DB_USER está configurado como "postgres" en Render');
      console.error('   Esto indica que las variables de entorno de Render no se están aplicando correctamente.');
    } else {
      console.log('✅ DB_USER no es "postgres", lo cual es correcto en Render');
    }

    // Verificar que DB_PORT esté definido
    if (!process.env.DB_PORT) {
      console.error('❌ ERROR: DB_PORT no está definido en Render');
      console.error('   Esto puede causar problemas de conexión.');
    } else {
      console.log(`✅ DB_PORT está definido: ${process.env.DB_PORT}`);
    }
  }
  
  // Intentar conectar a la base de datos
  console.log('\nIntentando conectar a la base de datos PostgreSQL...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'registro_pasajeros',
    port: process.env.DB_PORT || 5432,
    connectionTimeoutMillis: 10000, // 10 segundos
    ssl: isRender ? { rejectUnauthorized: false } : false // Habilitar SSL en Render
  };
  
  // Mostrar información detallada de la conexión
  console.log('Información detallada de la conexión:');
  console.log(`- Entorno: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 
  console.log(`- Host: ${config.host}`); 
  console.log(`- Usuario: ${config.user}`); 
  console.log(`- Base de datos: ${config.database}`);
  console.log(`- Puerto: ${config.port}`);
  console.log(`- SSL: ${isRender ? 'Habilitado' : 'Deshabilitado'}`);
  
  const pool = new Pool(config);
  let client;

  try {
    console.log(`Conectando a ${config.host} con usuario ${config.user}...`);
    client = await pool.connect();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    
    // Verificar que podemos ejecutar consultas
    console.log('\nVerificando consulta simple...');
    const result = await client.query('SELECT 1 as test');
    console.log(`✅ Consulta exitosa: ${JSON.stringify(result.rows)}`);
    
    // Verificar tablas existentes
    console.log('\nVerificando tablas existentes...');
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('Tablas encontradas:');
    if (tables.rows.length === 0) {
      console.log('- No se encontraron tablas');
    } else {
      tables.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // Verificar si existen las tablas principales
    const requiredTables = ['usuarios', 'rutas', 'registros'];
    const existingTables = tables.rows.map(t => t.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️ ADVERTENCIA: Faltan algunas tablas requeridas:');
      missingTables.forEach(t => console.log(`- ${t}`));
      console.log('Puede ser necesario inicializar la base de datos con: npm run init-db');
    } else {
      console.log('\n✅ Todas las tablas requeridas están presentes');
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Verificación de base de datos completada con éxito');
    if (hasErrors) {
      console.log('\n⚠️ Se encontraron algunos problemas que deben corregirse');
      process.exit(1);
    } else {
      console.log('\n✅ Todo parece estar correctamente configurado');
      process.exit(0);
    }
  } catch (error) {
    console.error(`\n❌ Error al conectar a la base de datos: ${error.message}`);
    if (client) client.release();
    if (pool) await pool.end();
    
    if (isRender) {
      console.error('\nPosibles soluciones para entorno Render:');
      console.error('1. Verifica que el servicio de base de datos esté correctamente configurado en render.yaml');
      console.error('2. Asegúrate de que las variables de entorno estén correctamente configuradas');
      console.error('3. Verifica que la base de datos PostgreSQL esté creada y en ejecución');
      console.error('4. Comprueba que el usuario tenga permisos para acceder a la base de datos');
    } else {
      console.error('\nPosibles soluciones para entorno local:');
      console.error('1. Verifica que PostgreSQL esté instalado y en ejecución');
      console.error('2. Comprueba las credenciales en el archivo .env');
      console.error('3. Asegúrate de que la base de datos esté creada');
    }
    
    process.exit(1);
  }
}

// Si se ejecuta directamente este archivo
if (require.main === module) {
  checkRenderDb();
}

module.exports = { checkRenderDb };