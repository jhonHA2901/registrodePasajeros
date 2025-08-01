/**
 * Script para verificar la configuración de Render
 * Ejecutar con: node checkRenderConfig.js
 */

require('dotenv').config();

function checkRenderConfig() {
  console.log('=== VERIFICADOR DE CONFIGURACIÓN DE RENDER ===');
  
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`); 
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'no definido'}`); 
  
  // Variables de entorno críticas
  const criticalVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'PORT'
  ];
  
  console.log('\nVariables de entorno críticas:');
  let missingVars = 0;
  
  criticalVars.forEach(varName => {
    const value = process.env[varName];
    const masked = varName.includes('PASSWORD') ? '********' : value;
    
    if (!value) {
      console.log(`❌ ${varName}: NO DEFINIDO`);
      missingVars++;
    } else {
      console.log(`✅ ${varName}: ${masked}`);
    }
  });
  
  // Variables específicas de Render
  console.log('\nVariables específicas de Render:');
  const renderVars = [
    'RENDER_EXTERNAL_URL',
    'RENDER_SERVICE_ID',
    'RENDER_SERVICE_NAME',
    'RENDER_GIT_BRANCH',
    'RENDER_GIT_COMMIT'
  ];
  
  renderVars.forEach(varName => {
    const value = process.env[varName];
    if (!value && isRender) {
      console.log(`❓ ${varName}: NO DEFINIDO (esperado en Render)`);
    } else if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`ℹ️ ${varName}: no definido (normal en entorno local)`);
    }
  });
  
  // Resumen
  console.log('\n=== RESUMEN ===');
  if (missingVars > 0) {
    console.log(`❌ Faltan ${missingVars} variables críticas. La aplicación puede no funcionar correctamente.`);
    return false;
  } else {
    console.log('✅ Todas las variables críticas están definidas.');
    if (isRender) {
      console.log('✅ Entorno de Render detectado correctamente.');
    } else {
      console.log('ℹ️ Ejecutando en entorno local.');
    }
    return true;
  }
}

// Ejecutar la verificación
const configOk = checkRenderConfig();

if (!configOk) {
  console.error('\n⚠️ La configuración tiene problemas que deben resolverse.');
  // No salimos con error para permitir que el servidor intente iniciar
} else {
  console.log('\n✅ Configuración correcta. El servidor debería iniciar sin problemas.');
}