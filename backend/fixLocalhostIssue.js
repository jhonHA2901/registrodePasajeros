/**
 * Script para corregir el problema específico de localhost en Render
 * Este script detecta y corrige automáticamente el uso de localhost en Render
 */

// Verificar si estamos en Render
const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;

if (!isRender) {
  console.log('Este script solo debe ejecutarse en entorno de Render');
  process.exit(0); // Salir sin error en entorno local
}

console.log('🔍 Verificando configuración de host de base de datos en Render...');

// Verificar DB_HOST
if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST.includes('127.0.0.1')) {
  console.log('⚠️ ERROR CRÍTICO: DB_HOST está configurado como localhost o no está definido');
  
  // Intentar obtener el host correcto del servicio de base de datos
  const renderDbService = 'registrop1-db';
  const expectedHostFormat = `${renderDbService}.internal`;
  
  console.log(`ℹ️ Intentando corregir automáticamente. Configurando DB_HOST=${expectedHostFormat}`);
  
  // Establecer el valor correcto
  process.env.DB_HOST = expectedHostFormat;
  
  console.log('✅ DB_HOST corregido temporalmente para esta ejecución');
  console.log('⚠️ ADVERTENCIA: Esta es una corrección temporal. Debes corregir render.yaml');
  console.log('   → Asegúrate de que la sección "fromDatabase" esté correctamente configurada:');
  console.log('   ```yaml');
  console.log('   - key: DB_HOST');
  console.log('     fromDatabase:');
  console.log(`       name: ${renderDbService}`);
  console.log('       property: host');
  console.log('   ```');
} else {
  console.log(`✅ DB_HOST está configurado correctamente: ${process.env.DB_HOST}`);
}

// Verificar otras variables críticas
const criticalVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'];
let missingVars = false;

criticalVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ ${varName} no está definido`);
    missingVars = true;
  } else {
    const value = varName === 'DB_PASSWORD' ? '********' : process.env[varName];
    console.log(`✅ ${varName}: ${value}`);
  }
});

if (missingVars) {
  console.log('⚠️ Faltan variables críticas. La aplicación puede no funcionar correctamente.');
} else {
  console.log('✅ Todas las variables críticas están definidas.');
}

// Continuar con la ejecución normal
process.exit(0);