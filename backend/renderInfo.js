/**
 * Script para mostrar información detallada sobre el entorno de Render
 * Útil para diagnosticar problemas de despliegue
 * Ejecutar con: node renderInfo.js
 */

require('dotenv').config();
const os = require('os');

function printRenderInfo() {
  console.log('=== INFORMACIÓN DEL ENTORNO DE RENDER ===');
  console.log('Fecha y hora:', new Date().toISOString());
  
  // Detectar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`\nEntorno detectado: ${isRender ? '✅ RENDER (PRODUCCIÓN)' : '❌ LOCAL (DESARROLLO)'}`);
  
  // Información del sistema
  console.log('\n--- INFORMACIÓN DEL SISTEMA ---');
  console.log(`Plataforma: ${os.platform()}`);
  console.log(`Arquitectura: ${os.arch()}`);
  console.log(`Versión de Node.js: ${process.version}`);
  console.log(`Memoria total: ${Math.round(os.totalmem() / (1024 * 1024))} MB`);
  console.log(`Memoria libre: ${Math.round(os.freemem() / (1024 * 1024))} MB`);
  console.log(`CPUs: ${os.cpus().length}`);
  
  // Variables de entorno de Render
  console.log('\n--- VARIABLES DE ENTORNO DE RENDER ---');
  const renderVars = [
    'RENDER_EXTERNAL_URL',
    'RENDER_SERVICE_ID',
    'RENDER_SERVICE_NAME',
    'RENDER_GIT_BRANCH',
    'RENDER_GIT_COMMIT',
    'RENDER_INSTANCE_ID'
  ];
  
  renderVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`${varName}: ${value}`);
    } else {
      console.log(`${varName}: no definido ${isRender ? '⚠️' : '(normal en entorno local)'}`);
    }
  });
  
  // Variables de entorno de la aplicación
  console.log('\n--- VARIABLES DE ENTORNO DE LA APLICACIÓN ---');
  const appVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_USER',
    'DB_NAME'
  ];
  
  appVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`${varName}: ${value}`);
    } else {
      console.log(`${varName}: no definido ⚠️`);
    }
  });
  
  // Información de red
  console.log('\n--- INFORMACIÓN DE RED ---');
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach(ifaceName => {
    interfaces[ifaceName].forEach(iface => {
      if (iface.family === 'IPv4') {
        console.log(`Interfaz: ${ifaceName}, Dirección: ${iface.address}`);
      }
    });
  });
  
  // Resumen
  console.log('\n=== RESUMEN ===');
  if (isRender) {
    console.log('✅ Ejecutando en Render (entorno de producción)');
    console.log(`✅ URL externa: ${process.env.RENDER_EXTERNAL_URL}`);
    console.log(`✅ Servicio: ${process.env.RENDER_SERVICE_NAME || 'desconocido'}`);
  } else {
    console.log('ℹ️ Ejecutando en entorno local de desarrollo');
    console.log('ℹ️ Para desplegar en Render, sigue las instrucciones en DEPLOY_RENDER.md');
  }
}

// Ejecutar
printRenderInfo();