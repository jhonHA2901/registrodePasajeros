/**
 * Script para verificar la configuración de despliegue
 * Ejecutar con: node checkDeployment.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  try {
    fs.accessSync(fullPath, fs.constants.F_OK);
    console.log(`✅ ${description} (${filePath}) existe`);
    return true;
  } catch (err) {
    console.error(`❌ ${description} (${filePath}) NO EXISTE`);
    return false;
  }
}

function runCommand(command, description) {
  try {
    console.log(`\n🔄 Ejecutando: ${command}`);
    const output = execSync(command, { cwd: __dirname, encoding: 'utf8' });
    console.log(`✅ ${description} completado`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} falló: ${error.message}`);
    return false;
  }
}

function checkDeployment() {
  console.log('=== VERIFICACIÓN DE CONFIGURACIÓN PARA DESPLIEGUE EN RENDER ===');
  console.log('Fecha y hora:', new Date().toISOString());
  
  // Verificar archivos críticos
  console.log('\n--- ARCHIVOS CRÍTICOS ---');
  const criticalFiles = [
    { path: 'render.yaml', description: 'Configuración de Render' },
    { path: 'backend/server.js', description: 'Servidor backend' },
    { path: 'backend/db.js', description: 'Configuración de base de datos' },
    { path: 'backend/initDb.js', description: 'Script de inicialización de base de datos' },
    { path: 'backend/checkDbConnection.js', description: 'Script de verificación de conexión a base de datos' },
    { path: 'backend/checkRenderConfig.js', description: 'Script de verificación de configuración de Render' },
    { path: 'backend/renderInfo.js', description: 'Script de información de Render' },
    { path: 'frontend/index.html', description: 'Página principal del frontend' },
    { path: 'frontend/js/config.js', description: 'Configuración del frontend' },
    { path: 'sql/base_datos.sql', description: 'Script SQL de base de datos' },
    { path: 'DEPLOY_RENDER.md', description: 'Documentación de despliegue' }
  ];
  
  let missingFiles = 0;
  criticalFiles.forEach(file => {
    if (!checkFile(file.path, file.description)) {
      missingFiles++;
    }
  });
  
  // Verificar configuración de Render
  console.log('\n--- CONFIGURACIÓN DE RENDER ---');
  const renderYamlPath = path.join(__dirname, 'render.yaml');
  try {
    const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
    
    // Verificar servicios
    if (renderYaml.includes('registrop1-backend')) {
      console.log('✅ Servicio backend configurado en render.yaml');
    } else {
      console.error('❌ Servicio backend NO configurado en render.yaml');
    }
    
    if (renderYaml.includes('registrop1-frontend')) {
      console.log('✅ Servicio frontend configurado en render.yaml');
    } else {
      console.error('❌ Servicio frontend NO configurado en render.yaml');
    }
    
    if (renderYaml.includes('registrop1-db')) {
      console.log('✅ Base de datos configurada en render.yaml');
    } else {
      console.error('❌ Base de datos NO configurada en render.yaml');
    }
    
    // Verificar dependencias
    if (renderYaml.includes('dependsOn')) {
      console.log('✅ Dependencias entre servicios configuradas');
    } else {
      console.error('❌ Dependencias entre servicios NO configuradas');
    }
  } catch (err) {
    console.error(`❌ No se pudo leer render.yaml: ${err.message}`);
  }
  
  // Verificar configuración del frontend
  console.log('\n--- CONFIGURACIÓN DEL FRONTEND ---');
  const configJsPath = path.join(__dirname, 'frontend', 'js', 'config.js');
  try {
    const configJs = fs.readFileSync(configJsPath, 'utf8');
    
    if (configJs.includes('registrop1-backend.onrender.com')) {
      console.log('✅ Frontend configurado para conectarse al backend en Render');
    } else {
      console.error('❌ Frontend NO configurado para conectarse al backend en Render');
    }
  } catch (err) {
    console.error(`❌ No se pudo leer config.js: ${err.message}`);
  }
  
  // Ejecutar scripts de verificación
  console.log('\n--- EJECUTANDO SCRIPTS DE VERIFICACIÓN ---');
  runCommand('cd backend && node checkRenderConfig.js', 'Verificación de configuración de Render');
  runCommand('cd backend && node checkRenderDb.js', 'Verificación de configuración de base de datos en Render');
  runCommand('cd backend && node checkCors.js', 'Verificación de configuración CORS');
  runCommand('cd backend && node checkSecurity.js', 'Verificación de configuración de seguridad');
  runCommand('cd backend && node checkPerformance.js', 'Verificación de rendimiento');
  
  // Resumen
  console.log('\n=== RESUMEN DE VERIFICACIÓN ===');
  if (missingFiles > 0) {
    console.error(`❌ Faltan ${missingFiles} archivos críticos. Corrige los problemas antes de desplegar.`);
  } else {
    console.log('✅ Todos los archivos críticos están presentes.');
  }
  
  console.log('\n--- PRÓXIMOS PASOS ---');
  console.log('1. Asegúrate de que todos los cambios estén confirmados en Git');
  console.log('2. Sube los cambios a GitHub: git push origin master');
  console.log('3. Despliega en Render siguiendo las instrucciones en DEPLOY_RENDER.md');
}

// Ejecutar la verificación
checkDeployment();