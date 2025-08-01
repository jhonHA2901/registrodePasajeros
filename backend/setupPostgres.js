/**
 * Script para configurar PostgreSQL en el entorno local y en Render
 * Ejecutar con: node setupPostgres.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Verificar si estamos en Render
const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;

async function setupPostgres() {
  console.log('=== CONFIGURACIÓN DE POSTGRESQL ===');
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 
  
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
  
  console.log('\nInformación de conexión:');
  console.log(`- Host: ${config.host}`);
  console.log(`- Usuario: ${config.user}`);
  console.log(`- Base de datos: ${config.database}`);
  console.log(`- Puerto: ${config.port}`);
  console.log(`- SSL: ${isRender ? 'Habilitado' : 'Deshabilitado'}`);
  
  // Crear pool de conexiones
  const pool = new Pool(config);
  let client;
  
  try {
    // Intentar conectar a PostgreSQL
    console.log('\nIntentando conectar a PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar si la base de datos existe
    console.log('\nVerificando base de datos...');
    const dbResult = await client.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [config.database]
    );
    
    if (dbResult.rows.length === 0) {
      console.log(`La base de datos '${config.database}' no existe.`);
      
      if (!isRender) {
        // En entorno local, podemos intentar crear la base de datos
        console.log('Intentando crear la base de datos...');
        
        // Primero debemos cerrar la conexión actual
        client.release();
        await pool.end();
        
        // Conectar a la base de datos postgres (por defecto)
        const adminConfig = { ...config, database: 'postgres' };
        const adminPool = new Pool(adminConfig);
        const adminClient = await adminPool.connect();
        
        try {
          // Crear la base de datos
          await adminClient.query(`CREATE DATABASE ${config.database}`);
          console.log(`✅ Base de datos '${config.database}' creada correctamente`);
          
          adminClient.release();
          await adminPool.end();
          
          // Reconectar a la nueva base de datos
          const newPool = new Pool(config);
          client = await newPool.connect();
          pool = newPool;
          
          console.log('✅ Conectado a la nueva base de datos');
        } catch (error) {
          console.error(`Error al crear la base de datos: ${error.message}`);
          console.error('Debes crear la base de datos manualmente con:');
          console.error(`createdb ${config.database}`);
          
          adminClient.release();
          await adminPool.end();
          process.exit(1);
        }
      } else {
        console.error('En Render, la base de datos debe estar configurada en render.yaml');
        console.error('Verifica la configuración del servicio de base de datos');
        client.release();
        await pool.end();
        process.exit(1);
      }
    } else {
      console.log(`✅ Base de datos '${config.database}' existe`);
    }
    
    // Verificar tablas existentes
    console.log('\nVerificando tablas existentes...');
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    if (tables.rows.length === 0) {
      console.log('No se encontraron tablas en la base de datos');
      console.log('Ejecutando inicialización de la base de datos...');
      
      // Ejecutar script de inicialización
      const { initializeDatabase } = require('./initDb');
      await initializeDatabase();
      
      console.log('✅ Base de datos inicializada correctamente');
    } else {
      console.log('Tablas encontradas:');
      tables.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
      
      // Verificar si existen las tablas principales
      const requiredTables = ['usuarios', 'rutas', 'registros'];
      const existingTables = tables.rows.map(t => t.table_name);
      const missingTables = requiredTables.filter(t => !existingTables.includes(t));
      
      if (missingTables.length > 0) {
        console.log('\n⚠️ ADVERTENCIA: Faltan algunas tablas requeridas:');
        missingTables.forEach(t => console.log(`- ${t}`));
        
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        if (!isRender) {
          const answer = await new Promise(resolve => {
            rl.question('¿Deseas inicializar la base de datos? (s/n): ', resolve);
          });
          
          rl.close();
          
          if (answer.toLowerCase() === 's') {
            console.log('Ejecutando inicialización de la base de datos...');
            const { initializeDatabase } = require('./initDb');
            await initializeDatabase();
            console.log('✅ Base de datos inicializada correctamente');
          } else {
            console.log('Operación cancelada por el usuario');
          }
        } else {
          console.log('Ejecutando inicialización de la base de datos en Render...');
          const { initializeDatabase } = require('./initDb');
          await initializeDatabase();
          console.log('✅ Base de datos inicializada correctamente');
        }
      } else {
        console.log('\n✅ Todas las tablas requeridas están presentes');
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Configuración de PostgreSQL completada con éxito');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    
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
    
    process.exit(1);
  }
}

// Si se ejecuta directamente este archivo
if (require.main === module) {
  setupPostgres();
}

module.exports = { setupPostgres };