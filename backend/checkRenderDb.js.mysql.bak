/**
 * Script para verificar la configuración de la base de datos en Render
 * Ejecutar con: node checkRenderDb.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkRenderDb() {
  console.log('=== VERIFICADOR DE CONFIGURACIÓN DE BASE DE DATOS EN RENDER ===');
  
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
    } else if (process.env.DB_HOST && process.env.DB_HOST.includes('oregon-postgres.render.com')) {
      console.log('✅ DB_HOST parece ser una URL válida de Render');
    } else {
      console.log(`⚠️ DB_HOST no tiene el formato esperado para Render: ${process.env.DB_HOST}`);
    }
    
    // En Render, DB_USER no debería ser root
    if (process.env.DB_USER === 'root') {
      console.error('❌ ERROR: DB_USER está configurado como "root" en Render');
      console.error('   Esto indica que las variables de entorno de Render no se están aplicando correctamente.');
    } else {
      console.log('✅ DB_USER no es "root", lo cual es correcto en Render');
    }
  }
  
  // Intentar conectar a la base de datos
  console.log('\nIntentando conectar a la base de datos...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'registro_pasajeros',
    connectTimeout: 10000, // 10 segundos
    ssl: isRender ? {rejectUnauthorized: true} : false // Habilitar SSL en Render
  };
  
  // Mostrar información detallada de la conexión
  console.log('Información detallada de la conexión:');
  console.log(`- Entorno: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 
  console.log(`- Host: ${config.host}`); 
  console.log(`- Usuario: ${config.user}`); 
  console.log(`- Base de datos: ${config.database}`);
  console.log(`- SSL: ${isRender ? 'Habilitado' : 'Deshabilitado'}`);
  
  try {
    console.log(`Conectando a ${config.host} con usuario ${config.user}...`);
    const connection = await mysql.createConnection(config);
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar que podemos ejecutar consultas
    console.log('\nVerificando consulta simple...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log(`✅ Consulta exitosa: ${JSON.stringify(rows)}`);
    
    // Verificar tablas existentes
    console.log('\nVerificando tablas existentes...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tablas encontradas:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });
    
    await connection.end();
    console.log('\nConexión cerrada correctamente');
    return true;
  } catch (error) {
    console.error(`\n❌ ERROR DE CONEXIÓN: ${error.message}`);
    console.error('Código de error:', error.code);
    
    // Sugerir soluciones según el error
    console.log('\nPosibles soluciones:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('- Verifica que la base de datos esté en ejecución');
      console.log('- Asegúrate de que el host sea correcto');
      console.log('- Verifica que no haya un firewall bloqueando la conexión');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('- Verifica que el usuario y contraseña sean correctos');
      console.log('- Asegúrate de que el usuario tenga permisos para acceder a la base de datos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('- La base de datos no existe, ejecuta el script de inicialización');
      console.log('- Verifica que el nombre de la base de datos sea correcto');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('- La conexión ha excedido el tiempo de espera');
      console.log('- Verifica que la base de datos esté accesible desde tu ubicación');
      console.log('- En Render, asegúrate de que los servicios estén en la misma región');
    } else {
      console.log('- Verifica la configuración en render.yaml');
      console.log('- Asegúrate de que las variables de entorno estén correctamente definidas');
      console.log('- Revisa los logs de Render para más información');
    }
    
    return false;
  }
}

// Ejecutar la verificación
checkRenderDb()
  .then(success => {
    console.log('\n=== RESULTADO FINAL ===');
    if (success) {
      console.log('✅ La configuración de la base de datos parece correcta.');
      process.exit(0);
    } else {
      console.log('❌ Hay problemas con la configuración de la base de datos. Revisa los errores anteriores.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error inesperado:', err);
    process.exit(1);
  });