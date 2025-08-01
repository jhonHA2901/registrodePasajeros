/**
 * Script para verificar la configuración de seguridad en el backend
 * Ejecutar con: node checkSecurity.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Función para verificar la configuración de seguridad en server.js
function checkServerSecurityConfig() {
  console.log('\nVerificando configuración de seguridad en server.js...');
  
  const serverJsPath = path.join(__dirname, 'server.js');
  try {
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');
    let securityScore = 0;
    const maxScore = 5;
    
    // Verificar si se usa helmet
    if (serverJs.includes("require('helmet')") || serverJs.includes('require("helmet")')) {
      console.log('✅ Helmet está importado en server.js');
      securityScore++;
      
      if (serverJs.includes('app.use(helmet())') || serverJs.includes('app.use(helmet(')) {
        console.log('✅ Helmet está configurado como middleware en server.js');
        securityScore++;
      } else {
        console.error('❌ Helmet NO está configurado como middleware en server.js');
        console.error('   Añade: app.use(helmet());');
      }
    } else {
      console.error('❌ Helmet NO está importado en server.js');
      console.error('   Añade: const helmet = require(\'helmet\');');
    }
    
    // Verificar si se limita el tamaño de las solicitudes
    if (serverJs.includes('limit:') && serverJs.includes('extended:')) {
      console.log('✅ Se limita el tamaño de las solicitudes');
      securityScore++;
    } else {
      console.error('❌ NO se limita el tamaño de las solicitudes');
      console.error('   Añade: app.use(express.json({ limit: \'1mb\' }));');
      console.error('   Añade: app.use(express.urlencoded({ limit: \'1mb\', extended: true }));');
    }
    
    // Verificar si se usa rate limiting
    if (serverJs.includes('rate-limit') || serverJs.includes('rateLimit')) {
      console.log('✅ Se usa rate limiting para prevenir ataques de fuerza bruta');
      securityScore++;
    } else {
      console.error('❌ NO se usa rate limiting');
      console.error('   Considera añadir: const rateLimit = require(\'express-rate-limit\');');
      console.error('   Y configurarlo: app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));');
    }
    
    // Verificar si se usa validación de entrada
    if (serverJs.includes('validator') || serverJs.includes('joi') || serverJs.includes('express-validator')) {
      console.log('✅ Se usa validación de entrada');
      securityScore++;
    } else {
      console.error('❌ NO se detecta validación de entrada');
      console.error('   Considera usar express-validator, joi u otra biblioteca de validación');
    }
    
    // Calcular porcentaje de seguridad
    const securityPercentage = (securityScore / maxScore) * 100;
    console.log(`\nPuntuación de seguridad: ${securityScore}/${maxScore} (${securityPercentage.toFixed(1)}%)`);
    
    return {
      score: securityScore,
      maxScore: maxScore,
      percentage: securityPercentage
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

// Función para verificar la configuración de autenticación
function checkAuthConfig() {
  console.log('\nVerificando configuración de autenticación...');
  
  const authControllerPath = path.join(__dirname, 'controllers', 'authController.js');
  try {
    const authController = fs.readFileSync(authControllerPath, 'utf8');
    let authScore = 0;
    const maxScore = 5;
    
    // Verificar si se usa bcrypt para el hash de contraseñas
    if (authController.includes("require('bcrypt')") || authController.includes('require("bcrypt")')) {
      console.log('✅ Se usa bcrypt para el hash de contraseñas');
      authScore++;
      
      // Verificar el costo de bcrypt
      const saltRoundsMatch = authController.match(/bcrypt\.genSalt\((\d+)\)/) || 
                             authController.match(/bcrypt\.hash\([^,]+,\s*(\d+)\)/); 
      
      if (saltRoundsMatch) {
        const saltRounds = parseInt(saltRoundsMatch[1]);
        if (saltRounds >= 10) {
          console.log(`✅ El costo de bcrypt es adecuado (${saltRounds})`);
          authScore++;
        } else {
          console.error(`❌ El costo de bcrypt es demasiado bajo (${saltRounds})`);
          console.error('   Considera aumentarlo a al menos 10');
        }
      }
    } else {
      console.error('❌ NO se usa bcrypt para el hash de contraseñas');
      console.error('   Añade: const bcrypt = require(\'bcrypt\');');
    }
    
    // Verificar si se usa JWT
    if (authController.includes('jwt.sign') || authController.includes('jwt.verify')) {
      console.log('✅ Se usa JWT para la autenticación');
      authScore++;
      
      // Verificar si se usa una clave secreta segura
      if (authController.includes('process.env.JWT_SECRET')) {
        console.log('✅ Se usa una variable de entorno para la clave secreta de JWT');
        authScore++;
      } else if (authController.includes('JWT_SECRET') || authController.includes('jwtSecret')) {
        console.log('⚠️ Se usa una variable para la clave secreta de JWT, pero no está claro si es una variable de entorno');
      } else {
        console.error('❌ NO se detecta el uso de una variable de entorno para la clave secreta de JWT');
        console.error('   Usa: process.env.JWT_SECRET');
      }
    } else {
      console.error('❌ NO se detecta el uso de JWT para la autenticación');
      console.error('   Considera usar jsonwebtoken: const jwt = require(\'jsonwebtoken\');');
    }
    
    // Verificar si se usa expiración en los tokens
    if (authController.includes('expiresIn:') || authController.includes('expiresIn =')) {
      console.log('✅ Se configura la expiración de los tokens');
      authScore++;
    } else {
      console.error('❌ NO se detecta configuración de expiración de tokens');
      console.error('   Añade: { expiresIn: \'1h\' } en la configuración de jwt.sign');
    }
    
    // Calcular porcentaje de autenticación
    const authPercentage = (authScore / maxScore) * 100;
    console.log(`\nPuntuación de autenticación: ${authScore}/${maxScore} (${authPercentage.toFixed(1)}%)`);
    
    return {
      score: authScore,
      maxScore: maxScore,
      percentage: authPercentage
    };
  } catch (err) {
    console.error(`❌ No se pudo leer authController.js: ${err.message}`);
    return {
      score: 0,
      maxScore: 5,
      percentage: 0
    };
  }
}

// Función para verificar las variables de entorno
function checkEnvironmentVariables() {
  console.log('\nVerificando variables de entorno sensibles...');
  
  // Variables de entorno que deberían estar configuradas
  const requiredEnvVars = [
    { name: 'JWT_SECRET', sensitive: true },
    { name: 'DB_PASSWORD', sensitive: true },
    { name: 'NODE_ENV', sensitive: false }
  ];
  
  let envScore = 0;
  const maxScore = requiredEnvVars.length;
  
  // Verificar cada variable de entorno
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar.name]) {
      if (envVar.sensitive) {
        console.log(`✅ ${envVar.name} está configurada (valor oculto por seguridad)`);
      } else {
        console.log(`✅ ${envVar.name} está configurada: ${process.env[envVar.name]}`);
      }
      envScore++;
    } else {
      console.error(`❌ ${envVar.name} NO está configurada`);
    }
  });
  
  // Verificar si existe el archivo .env
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Archivo .env existe');
    
    // Verificar si .env está en .gitignore
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignore.includes('.env')) {
        console.log('✅ .env está incluido en .gitignore');
      } else {
        console.error('❌ .env NO está incluido en .gitignore');
        console.error('   Añade ".env" a tu archivo .gitignore para evitar exponer secretos');
      }
    }
  } else {
    console.error('❌ Archivo .env NO existe');
  }
  
  if (fs.existsSync(envExamplePath)) {
    console.log('✅ Archivo .env.example existe (buena práctica)');
  } else {
    console.error('❌ Archivo .env.example NO existe');
    console.error('   Crea un archivo .env.example con las variables requeridas (sin valores sensibles)');
  }
  
  // Calcular porcentaje de variables de entorno
  const envPercentage = (envScore / maxScore) * 100;
  console.log(`\nPuntuación de variables de entorno: ${envScore}/${maxScore} (${envPercentage.toFixed(1)}%)`);
  
  return {
    score: envScore,
    maxScore: maxScore,
    percentage: envPercentage
  };
}

// Función para generar una clave secreta segura
function generateSecureSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Función principal
async function checkSecurity() {
  console.log('=== VERIFICADOR DE CONFIGURACIÓN DE SEGURIDAD ===');
  
  // Verificar si estamos en Render
  const isRender = process.env.RENDER_EXTERNAL_URL ? true : false;
  console.log(`Entorno detectado: ${isRender ? 'Render (producción)' : 'Local (desarrollo)'}`);
  
  // Verificar la configuración de seguridad en server.js
  const securityResult = checkServerSecurityConfig();
  
  // Verificar la configuración de autenticación
  const authResult = checkAuthConfig();
  
  // Verificar las variables de entorno
  const envResult = checkEnvironmentVariables();
  
  // Calcular puntuación total
  const totalScore = securityResult.score + authResult.score + envResult.score;
  const maxTotalScore = securityResult.maxScore + authResult.maxScore + envResult.maxScore;
  const totalPercentage = (totalScore / maxTotalScore) * 100;
  
  // Mostrar recomendaciones
  console.log('\n=== RECOMENDACIONES DE SEGURIDAD ===');
  
  if (securityResult.percentage < 60) {
    console.log('1. Mejora la seguridad general del servidor:');
    console.log('   - Instala y configura helmet: npm install helmet');
    console.log('   - Limita el tamaño de las solicitudes');
    console.log('   - Implementa rate limiting para prevenir ataques de fuerza bruta');
  }
  
  if (authResult.percentage < 60) {
    console.log('2. Mejora la seguridad de autenticación:');
    console.log('   - Usa bcrypt con un costo de al menos 10 para el hash de contraseñas');
    console.log('   - Implementa JWT con una clave secreta segura almacenada en variables de entorno');
    console.log('   - Configura la expiración de los tokens');
  }
  
  if (envResult.percentage < 60) {
    console.log('3. Mejora la gestión de variables de entorno:');
    console.log('   - Crea un archivo .env para almacenar variables sensibles');
    console.log('   - Asegúrate de incluir .env en .gitignore');
    console.log('   - Crea un archivo .env.example como referencia');
  }
  
  console.log('\n4. Clave secreta JWT segura generada (para referencia):');
  console.log(`   JWT_SECRET=${generateSecureSecret()}`);
  console.log('   Añade esta clave a tu archivo .env (¡no la compartas ni la incluyas en el código!)\n');
  
  console.log('=== RESULTADO FINAL ===');
  console.log(`Puntuación total de seguridad: ${totalScore}/${maxTotalScore} (${totalPercentage.toFixed(1)}%)`);
  
  if (totalPercentage >= 80) {
    console.log('✅ La configuración de seguridad es buena.');
    process.exit(0);
  } else if (totalPercentage >= 60) {
    console.log('⚠️ La configuración de seguridad es aceptable, pero puede mejorarse.');
    process.exit(0);
  } else {
    console.log('❌ La configuración de seguridad es insuficiente. Revisa las recomendaciones anteriores.');
    process.exit(1);
  }
}

// Ejecutar la verificación
checkSecurity();