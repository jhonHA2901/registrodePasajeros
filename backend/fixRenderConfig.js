/**
 * Script para corregir automáticamente problemas comunes de configuración en Render
 * Este script se ejecuta antes de iniciar el servidor en entorno de Render
 */

// Verificar si estamos en Render
const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;

if (!isRender) {
  console.log('Este script solo debe ejecutarse en entorno de Render');
  process.exit(0); // Salir sin error en entorno local
}

console.log('🔧 Iniciando corrección automática de configuración en Render...');

// Verificar y corregir problemas comunes
let configFixed = false;

// 1. Verificar DB_HOST
if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST.includes('127.0.0.1')) {
  console.log('⚠️ ERROR: DB_HOST está configurado incorrectamente');
  console.log('   → No se puede corregir automáticamente. Verifica render.yaml');
  console.log('   → Asegúrate de que la sección "fromDatabase" esté correctamente configurada');
  process.exit(1); // Error crítico que no se puede corregir automáticamente
}

// 2. Verificar SSL para MySQL
if (!process.env.MYSQL_ATTR_SSL_CA) {
  console.log('ℹ️ Configurando SSL para MySQL en Render...');
  process.env.MYSQL_ATTR_SSL_CA = 'true';
  configFixed = true;
}

// 3. Verificar timeout de conexión
if (!process.env.DB_CONNECTION_TIMEOUT) {
  console.log('ℹ️ Configurando timeout de conexión a la base de datos...');
  process.env.DB_CONNECTION_TIMEOUT = '60000'; // 60 segundos
  configFixed = true;
}

// 4. Verificar número de reintentos
if (!process.env.DB_CONNECTION_RETRIES) {
  console.log('ℹ️ Configurando número de reintentos de conexión...');
  process.env.DB_CONNECTION_RETRIES = '5';
  configFixed = true;
}

// Resumen
if (configFixed) {
  console.log('✅ Se han aplicado correcciones automáticas a la configuración');
} else {
  console.log('✅ La configuración parece estar correcta');
}

console.log('✅ Verificación de configuración completada');

// Continuar con la ejecución normal
process.exit(0);