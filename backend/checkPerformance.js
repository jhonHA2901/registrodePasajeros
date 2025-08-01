/**
 * Script para verificar el rendimiento del backend
 * Ejecutar con: node checkPerformance.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { performance } = require('perf_hooks');
const os = require('os');

// Función para verificar la configuración de rendimiento en server.js
function checkServerPerformanceConfig() {
  console.log('\nVerificando configuración de rendimiento en server.js...');
  
  const serverJsPath = path.join(__dirname, 'server.js');
  try {
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');
    let performanceScore = 0;
    const maxScore = 5;
    
    // Verificar si se usa compression
    if (serverJs.includes("require('compression')") || serverJs.includes('require("compression")')) {
      console.log('✅ Compression está importado en server.js');
      performanceScore++;
      
      if (serverJs.includes('app.use(compression())') || serverJs.includes('app.use(compression(')) {
        console.log('✅ Compression está configurado como middleware en server.js');
        performanceScore++;
      } else {
        console.error('❌ Compression NO está configurado como middleware en server.js');
        console.error('   Añade: app.use(compression());');
      }
    } else {
      console.error('❌ Compression NO está importado en server.js');
      console.error('   Añade: const compression = require(\'compression\');');
    }
    
    // Verificar si se usa caché
    if (serverJs.includes('Cache-Control') || serverJs.includes('cache-control')) {
      console.log('✅ Se configuran encabezados de caché');
      performanceScore++;
    } else {
      console.error('❌ NO se detectan encabezados de caché');
      console.error('   Considera añadir: res.set(\'Cache-Control\', \'public, max-age=300\');');
    }
    
    // Verificar si se usa clustering
    if (serverJs.includes('cluster') && (serverJs.includes('os.cpus()') || serverJs.includes('numCPUs'))) {
      console.log('✅ Se usa clustering para aprovechar múltiples núcleos');
      performanceScore++;
    } else {
      console.error('❌ NO se usa clustering');
      console.error('   Considera implementar clustering para mejorar el rendimiento en producción');
    }
    
    // Verificar si se usa una conexión de base de datos eficiente (pool)
    if (serverJs.includes('createPool') || fs.existsSync(path.join(__dirname, 'db.js')) && fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8').includes('createPool')) {
      console.log('✅ Se usa un pool de conexiones para la base de datos');
      performanceScore++;
    } else {
      console.error('❌ NO se detecta el uso de un pool de conexiones para la base de datos');
      console.error('   Considera usar un pool de conexiones para mejorar el rendimiento');
    }
    
    // Calcular porcentaje de rendimiento
    const performancePercentage = (performanceScore / maxScore) * 100;
    console.log(`\nPuntuación de rendimiento: ${performanceScore}/${maxScore} (${performancePercentage.toFixed(1)}%)`);
    
    return {
      score: performanceScore,
      maxScore: maxScore,
      percentage: performancePercentage
    };
  } catch (err) {
    console.error(`❌ No se pudo leer server.js: ${err.message}`);
    return {
      score: 0,
      maxScore: 5,
      percentage: 0
    };
  }
}

// Función para verificar la configuración de la base de datos
function checkDbPerformanceConfig() {
  console.log('\nVerificando configuración de rendimiento de la base de datos...');
  
  const dbJsPath = path.join(__dirname, 'db.js');
  try {
    const dbJs = fs.readFileSync(dbJsPath, 'utf8');
    let dbScore = 0;
    const maxScore = 3;
    
    // Verificar si se usa un pool de conexiones
    if (dbJs.includes('createPool')) {
      console.log('✅ Se usa un pool de conexiones');
      dbScore++;
      
      // Verificar la configuración del pool
      const connectionLimitMatch = dbJs.match(/connectionLimit:\s*(\d+)/);
      if (connectionLimitMatch) {
        const connectionLimit = parseInt(connectionLimitMatch[1]);
        if (connectionLimit > 0) {
          console.log(`✅ El límite de conexiones está configurado: ${connectionLimit}`);
          dbScore++;
        } else {
          console.error('❌ El límite de conexiones es demasiado bajo');
        }
      } else {
        console.error('❌ No se detecta configuración de límite de conexiones');
        console.error('   Añade: connectionLimit: 10');
      }
    } else {
      console.error('❌ NO se usa un pool de conexiones');
      console.error('   Considera usar mysql2.createPool() en lugar de createConnection');
    }
    
    // Verificar si se cierran las conexiones correctamente
    if (dbJs.includes('.end()') || dbJs.includes('.release()')) {
      console.log('✅ Se cierran o liberan las conexiones correctamente');
      dbScore++;
    } else {
      console.error('❌ NO se detecta cierre o liberación de conexiones');
      console.error('   Asegúrate de cerrar o liberar las conexiones después de usarlas');
    }
    
    // Calcular porcentaje de rendimiento de la base de datos
    const dbPercentage = (dbScore / maxScore) * 100;
    console.log(`\nPuntuación de rendimiento de la base de datos: ${dbScore}/${maxScore} (${dbPercentage.toFixed(1)}%)`);
    
    return {
      score: dbScore,
      maxScore: maxScore,
      percentage: dbPercentage
    };
  } catch (err) {
    console.error(`❌ No se pudo leer db.js: ${err.message}`);
    return {
      score: 0,
      maxScore: 3,
      percentage: 0
    };
  }
}

// Función para realizar pruebas de rendimiento básicas
async function runPerformanceTests() {
  console.log('\nRealizando pruebas de rendimiento básicas...');
  
  // Información del sistema
  console.log('\nInformación del sistema:');
  console.log(`CPU: ${os.cpus().length} núcleos`);
  console.log(`Memoria total: ${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`);
  console.log(`Memoria libre: ${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`);
  console.log(`Carga del sistema: ${os.loadavg().join(', ')}`);
  
  // Prueba de carga de memoria
  console.log('\nPrueba de carga de memoria:');
  const initialMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Uso inicial de memoria: ${initialMemoryUsage.toFixed(2)} MB`);
  
  // Crear un array grande para simular carga
  const arr = new Array(1000000).fill('test');
  
  const afterMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Uso de memoria después de carga: ${afterMemoryUsage.toFixed(2)} MB`);
  console.log(`Incremento de memoria: ${(afterMemoryUsage - initialMemoryUsage).toFixed(2)} MB`);
  
  // Liberar memoria
  arr.length = 0;
  global.gc && global.gc();
  
  // Prueba de rendimiento de CPU
  console.log('\nPrueba de rendimiento de CPU:');
  const startTime = performance.now();
  
  // Operación intensiva para CPU
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += Math.sqrt(i);
  }
  
  const endTime = performance.now();
  console.log(`Tiempo de ejecución: ${(endTime - startTime).toFixed(2)} ms`);
  
  // Prueba de latencia de red local
  console.log('\nPrueba de latencia de red local:');
  try {
    const startNetTime = performance.now();
    
    // Realizar una solicitud HTTP local usando la IP específica
    await new Promise((resolve, reject) => {
      const req = http.get('http://192.168.2.42:3000/health', (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        console.error(`Error en la solicitud: ${err.message}`);
        reject(err);
      });
      
      // Establecer un tiempo de espera
      req.setTimeout(5000, () => {
        req.abort();
        console.error('La solicitud ha excedido el tiempo de espera');
        reject(new Error('Timeout'));
      });
    });
    
    const endNetTime = performance.now();
    console.log(`Latencia de red local: ${(endNetTime - startNetTime).toFixed(2)} ms`);
  } catch (err) {
    console.error(`No se pudo realizar la prueba de latencia: ${err.message}`);
    console.error('Asegúrate de que el servidor esté en ejecución en el puerto 3000');
  }
  
  return {
    cpuCores: os.cpus().length,
    totalMemory: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2),
    freeMemory: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2),
    memoryUsage: (afterMemoryUsage - initialMemoryUsage).toFixed(2),
    cpuPerformance: (endTime - startTime).toFixed(2)
  };
}

// Función principal
async function checkPerformance() {
  console.log('=== VERIFICADOR DE RENDIMIENTO DEL BACKEND ===');
  
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`);
  
  // Verificar la configuración de rendimiento en server.js
  const serverResult = checkServerPerformanceConfig();
  
  // Verificar la configuración de rendimiento de la base de datos
  const dbResult = checkDbPerformanceConfig();
  
  // Realizar pruebas de rendimiento básicas
  let performanceMetrics;
  try {
    performanceMetrics = await runPerformanceTests();
  } catch (err) {
    console.error(`Error al realizar pruebas de rendimiento: ${err.message}`);
  }
  
  // Calcular puntuación total
  const totalScore = serverResult.score + dbResult.score;
  const maxTotalScore = serverResult.maxScore + dbResult.maxScore;
  const totalPercentage = (totalScore / maxTotalScore) * 100;
  
  // Mostrar recomendaciones
  console.log('\n=== RECOMENDACIONES DE RENDIMIENTO ===');
  
  if (serverResult.percentage < 60) {
    console.log('1. Mejora el rendimiento del servidor:');
    console.log('   - Instala y configura compression: npm install compression');
    console.log('   - Implementa encabezados de caché para recursos estáticos');
    console.log('   - Considera implementar clustering para aprovechar múltiples núcleos');
  }
  
  if (dbResult.percentage < 60) {
    console.log('2. Mejora el rendimiento de la base de datos:');
    console.log('   - Usa un pool de conexiones con un límite adecuado');
    console.log('   - Asegúrate de cerrar o liberar las conexiones después de usarlas');
    console.log('   - Considera implementar consultas preparadas para consultas frecuentes');
  }
  
  if (isRender) {
    console.log('3. Recomendaciones específicas para Render:');
    console.log('   - Asegúrate de que el plan de servicio sea adecuado para tu carga de trabajo');
    console.log('   - Considera usar un CDN para recursos estáticos');
    console.log('   - Implementa una estrategia de caché para reducir la carga del servidor');
  }
  
  console.log('\n=== RESULTADO FINAL ===');
  console.log(`Puntuación total de rendimiento: ${totalScore}/${maxTotalScore} (${totalPercentage.toFixed(1)}%)`);
  
  if (totalPercentage >= 80) {
    console.log('✅ La configuración de rendimiento es buena.');
    process.exit(0);
  } else if (totalPercentage >= 60) {
    console.log('⚠️ La configuración de rendimiento es aceptable, pero puede mejorarse.');
    process.exit(0);
  } else {
    console.log('❌ La configuración de rendimiento es insuficiente. Revisa las recomendaciones anteriores.');
    process.exit(1);
  }
}

// Ejecutar la verificación
checkPerformance();