/**
 * Script para verificar la configuración CORS en el backend
 * Ejecutar con: node checkCors.js
 */

require('dotenv').config();
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Función para obtener la URL del frontend
function getFrontendUrl() {
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  
  if (isRender) {
    // En Render, el frontend debería estar en registrop1-frontend.onrender.com
    return 'https://registrop1-frontend.onrender.com';
  } else {
    // En desarrollo local, asumimos que el frontend está en localhost:8080
    return 'http://localhost:8080';
  }
}

// Función para verificar la configuración CORS en server.js
function checkServerCorsConfig() {
  console.log('\nVerificando configuración CORS en server.js...');
  
  const serverJsPath = path.join(__dirname, 'server.js');
  try {
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');
    
    // Verificar si se importa cors
    if (serverJs.includes("require('cors')") || serverJs.includes('require("cors")')) {
      console.log('✅ CORS está importado en server.js');
    } else {
      console.error('❌ CORS NO está importado en server.js');
      console.error('   Añade: const cors = require(\'cors\');');
      return false;
    }
    
    // Verificar si se usa cors como middleware
    if (serverJs.includes('app.use(cors())') || serverJs.includes('app.use(cors(')) {
      console.log('✅ CORS está configurado como middleware en server.js');
      
      // Verificar si hay configuración específica de CORS
      if (serverJs.includes('origin:')) {
        console.log('✅ CORS tiene configuración específica de origen');
        
        // Extraer la configuración de origen si es posible
        const originMatch = serverJs.match(/origin:\s*['"](.*?)['"]/) || 
                           serverJs.match(/origin:\s*\[(.*?)\]/) || 
                           serverJs.match(/origin:\s*(\w+)/); 
        
        if (originMatch) {
          console.log(`   Configuración de origen: ${originMatch[1]}`);
        }
      } else {
        console.log('⚠️ CORS está usando la configuración por defecto (permite cualquier origen)');
      }
      
      return true;
    } else {
      console.error('❌ CORS NO está configurado como middleware en server.js');
      console.error('   Añade: app.use(cors());');
      return false;
    }
  } catch (err) {
    console.error(`❌ No se pudo leer server.js: ${err.message}`);
    return false;
  }
}

// Función para crear un servidor temporal para probar CORS
async function testCorsServer() {
  return new Promise((resolve) => {
    console.log('\nCreando servidor temporal para probar CORS...');
    
    const server = http.createServer((req, res) => {
      // Añadir encabezados CORS para prueba
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Manejar solicitudes OPTIONS (preflight)
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      
      // Responder con información CORS
      const parsedUrl = url.parse(req.url, true);
      
      if (parsedUrl.pathname === '/cors-test') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'CORS test successful',
          headers: req.headers,
          origin: req.headers.origin || 'No origin header',
          method: req.method
        }));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    
    // Usar un puerto diferente al de la aplicación principal
    const testPort = 3001;
    
    server.listen(testPort, () => {
      console.log(`✅ Servidor de prueba CORS iniciado en puerto ${testPort}`);
      console.log(`   URL de prueba: http://localhost:${testPort}/cors-test`);
      
      // Resolver con la información del servidor
      resolve({
        server,
        port: testPort,
        url: `http://localhost:${testPort}/cors-test`
      });
    });
  });
}

// Función para simular una solicitud CORS
async function simulateCorsRequest(testServerUrl, originUrl) {
  return new Promise((resolve) => {
    console.log(`\nSimulando solicitud CORS desde ${originUrl} a ${testServerUrl}...`);
    
    const options = {
      method: 'GET',
      headers: {
        'Origin': originUrl
      }
    };
    
    const req = http.request(testServerUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const corsHeaders = {
            'access-control-allow-origin': res.headers['access-control-allow-origin'],
            'access-control-allow-methods': res.headers['access-control-allow-methods'],
            'access-control-allow-headers': res.headers['access-control-allow-headers']
          };
          
          console.log('Respuesta del servidor de prueba:');
          console.log(`Status: ${res.statusCode}`);
          console.log('Encabezados CORS:');
          console.log(JSON.stringify(corsHeaders, null, 2));
          
          // Verificar si la respuesta tiene los encabezados CORS correctos
          if (res.headers['access-control-allow-origin']) {
            const allowOrigin = res.headers['access-control-allow-origin'];
            
            if (allowOrigin === '*') {
              console.log('✅ El servidor permite solicitudes de cualquier origen');
            } else if (allowOrigin === originUrl) {
              console.log(`✅ El servidor permite solicitudes específicamente desde ${originUrl}`);
            } else {
              console.error(`❌ El servidor permite solicitudes desde ${allowOrigin}, pero no desde ${originUrl}`);
            }
            
            resolve(true);
          } else {
            console.error('❌ El servidor no incluye encabezados CORS en la respuesta');
            resolve(false);
          }
        } catch (error) {
          console.error(`Error al procesar la respuesta: ${error.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error en la solicitud: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// Función principal
async function checkCors() {
  console.log('=== VERIFICADOR DE CONFIGURACIÓN CORS ===');
  
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`);
  
  // Obtener la URL del frontend
  const frontendUrl = getFrontendUrl();
  console.log(`URL del frontend: ${frontendUrl}`);
  
  // Verificar la configuración CORS en server.js
  const configOk = checkServerCorsConfig();
  
  // Crear un servidor temporal para probar CORS
  const testServer = await testCorsServer();
  
  // Simular una solicitud CORS desde el frontend
  const corsTestResult = await simulateCorsRequest(testServer.url, frontendUrl);
  
  // Cerrar el servidor de prueba
  testServer.server.close(() => {
    console.log('Servidor de prueba CORS cerrado');
  });
  
  // Mostrar recomendaciones
  console.log('\n=== RECOMENDACIONES ===');
  
  if (!configOk) {
    console.log('1. Asegúrate de importar y configurar CORS en server.js:');
    console.log('   const cors = require(\'cors\');');
    console.log('   app.use(cors());');
  }
  
  if (isRender) {
    console.log('2. Para producción en Render, considera configurar CORS específicamente:');
    console.log('   app.use(cors({');
    console.log('     origin: [\'https://registrop1-frontend.onrender.com\'],');
    console.log('     methods: [\'GET\', \'POST\', \'PUT\', \'DELETE\'],');
    console.log('     credentials: true');
    console.log('   }));');
  } else {
    console.log('2. Para desarrollo local, puedes usar la configuración por defecto:');
    console.log('   app.use(cors());');
  }
  
  console.log('\n=== RESULTADO FINAL ===');
  if (configOk && corsTestResult) {
    console.log('✅ La configuración CORS parece correcta.');
    process.exit(0);
  } else {
    console.log('❌ Hay problemas con la configuración CORS. Revisa las recomendaciones anteriores.');
    process.exit(1);
  }
}

// Ejecutar la verificación
checkCors();