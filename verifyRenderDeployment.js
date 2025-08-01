/**
 * Script para verificar todos los aspectos del despliegue en Render
 * Ejecutar con: node verifyRenderDeployment.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Función para crear una interfaz de línea de comandos interactiva
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Función para hacer una pregunta y obtener una respuesta
function question(rl, query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

// Función para ejecutar un comando y capturar su salida
function runCommand(command, description) {
  console.log(`\n${colors.fg.cyan}🔄 Ejecutando: ${command}${colors.reset}`);
  try {
    const output = execSync(command, { cwd: __dirname, encoding: 'utf8' });
    console.log(`${colors.fg.green}✅ ${description} completado${colors.reset}`);
    return { success: true, output };
  } catch (error) {
    console.error(`${colors.fg.red}❌ ${description} falló: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

// Función para verificar archivos críticos
function checkCriticalFiles() {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== VERIFICANDO ARCHIVOS CRÍTICOS ===${colors.reset}`);
  
  const criticalFiles = [
    { path: 'render.yaml', description: 'Configuración de Render' },
    { path: 'backend/server.js', description: 'Servidor backend' },
    { path: 'backend/db.js', description: 'Configuración de base de datos' },
    { path: 'backend/initDb.js', description: 'Script de inicialización de base de datos' },
    { path: 'frontend/index.html', description: 'Página principal del frontend' },
    { path: 'frontend/js/config.js', description: 'Configuración del frontend' },
    { path: 'sql/base_datos.sql', description: 'Script SQL de base de datos' },
    { path: 'DEPLOY_RENDER.md', description: 'Documentación de despliegue' }
  ];
  
  const verificationScripts = [
    { path: 'backend/checkRenderConfig.js', description: 'Script de verificación de configuración de Render' },
    { path: 'backend/checkDbConnection.js', description: 'Script de verificación de conexión a base de datos' },
    { path: 'backend/checkRenderDb.js', description: 'Script de verificación de base de datos en Render' },
    { path: 'backend/checkCors.js', description: 'Script de verificación de CORS' },
    { path: 'backend/checkSecurity.js', description: 'Script de verificación de seguridad' },
    { path: 'backend/checkPerformance.js', description: 'Script de verificación de rendimiento' },
    { path: 'backend/renderInfo.js', description: 'Script de información de Render' }
  ];
  
  let missingFiles = 0;
  let missingScripts = 0;
  
  // Verificar archivos críticos
  console.log(`\n${colors.fg.white}Archivos críticos:${colors.reset}`);
  criticalFiles.forEach(file => {
    const fullPath = path.join(__dirname, file.path);
    try {
      fs.accessSync(fullPath, fs.constants.F_OK);
      console.log(`${colors.fg.green}✅ ${file.description} (${file.path}) existe${colors.reset}`);
    } catch (err) {
      console.error(`${colors.fg.red}❌ ${file.description} (${file.path}) NO EXISTE${colors.reset}`);
      missingFiles++;
    }
  });
  
  // Verificar scripts de verificación
  console.log(`\n${colors.fg.white}Scripts de verificación:${colors.reset}`);
  verificationScripts.forEach(script => {
    const fullPath = path.join(__dirname, script.path);
    try {
      fs.accessSync(fullPath, fs.constants.F_OK);
      console.log(`${colors.fg.green}✅ ${script.description} (${script.path}) existe${colors.reset}`);
    } catch (err) {
      console.error(`${colors.fg.red}❌ ${script.description} (${script.path}) NO EXISTE${colors.reset}`);
      missingScripts++;
    }
  });
  
  return { missingFiles, missingScripts };
}

// Función para verificar la configuración de Render
function checkRenderConfig() {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== VERIFICANDO CONFIGURACIÓN DE RENDER ===${colors.reset}`);
  
  const renderYamlPath = path.join(__dirname, 'render.yaml');
  try {
    const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
    
    // Verificar servicios
    if (renderYaml.includes('registrop1-backend')) {
      console.log(`${colors.fg.green}✅ Servicio backend configurado en render.yaml${colors.reset}`);
    } else {
      console.error(`${colors.fg.red}❌ Servicio backend NO configurado en render.yaml${colors.reset}`);
    }
    
    if (renderYaml.includes('registrop1-frontend')) {
      console.log(`${colors.fg.green}✅ Servicio frontend configurado en render.yaml${colors.reset}`);
    } else {
      console.error(`${colors.fg.red}❌ Servicio frontend NO configurado en render.yaml${colors.reset}`);
    }
    
    if (renderYaml.includes('registrop1-db')) {
      console.log(`${colors.fg.green}✅ Base de datos configurada en render.yaml${colors.reset}`);
    } else {
      console.error(`${colors.fg.red}❌ Base de datos NO configurada en render.yaml${colors.reset}`);
    }
    
    // Verificar dependencias
    if (renderYaml.includes('dependsOn')) {
      console.log(`${colors.fg.green}✅ Dependencias entre servicios configuradas${colors.reset}`);
    } else {
      console.error(`${colors.fg.red}❌ Dependencias entre servicios NO configuradas${colors.reset}`);
    }
    
    // Verificar variables de entorno
    if (renderYaml.includes('envVars')) {
      console.log(`${colors.fg.green}✅ Variables de entorno configuradas${colors.reset}`);
      
      // Verificar variables específicas
      if (renderYaml.includes('DB_HOST') && renderYaml.includes('DB_USER') && 
          renderYaml.includes('DB_PASSWORD') && renderYaml.includes('DB_NAME')) {
        console.log(`${colors.fg.green}✅ Variables de base de datos configuradas${colors.reset}`);
      } else {
        console.error(`${colors.fg.red}❌ Variables de base de datos NO configuradas correctamente${colors.reset}`);
      }
    } else {
      console.error(`${colors.fg.red}❌ Variables de entorno NO configuradas${colors.reset}`);
    }
    
    return true;
  } catch (err) {
    console.error(`${colors.fg.red}❌ No se pudo leer render.yaml: ${err.message}${colors.reset}`);
    return false;
  }
}

// Función para ejecutar scripts de verificación
async function runVerificationScripts(rl) {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== EJECUTANDO SCRIPTS DE VERIFICACIÓN ===${colors.reset}`);
  
  const scripts = [
    { command: 'cd backend && node checkRenderConfig.js', description: 'Verificación de configuración de Render' },
    { command: 'cd backend && node checkRenderDb.js', description: 'Verificación de base de datos en Render' },
    { command: 'cd backend && node checkCors.js', description: 'Verificación de CORS' },
    { command: 'cd backend && node checkSecurity.js', description: 'Verificación de seguridad' },
    { command: 'cd backend && node checkPerformance.js', description: 'Verificación de rendimiento' }
  ];
  
  let results = [];
  
  for (const script of scripts) {
    const answer = await question(rl, `\n${colors.fg.yellow}¿Ejecutar ${script.description}? (s/n): ${colors.reset}`);
    
    if (answer.toLowerCase() === 's') {
      const result = runCommand(script.command, script.description);
      results.push({ ...script, ...result });
    } else {
      console.log(`${colors.fg.yellow}Omitiendo ${script.description}${colors.reset}`);
    }
  }
  
  return results;
}

// Función para verificar la conectividad entre frontend y backend
async function checkConnectivity(rl) {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== VERIFICANDO CONECTIVIDAD FRONTEND-BACKEND ===${colors.reset}`);
  
  const answer = await question(rl, `\n${colors.fg.yellow}¿Deseas abrir el archivo api-test.html para verificar la conectividad? (s/n): ${colors.reset}`);
  
  if (answer.toLowerCase() === 's') {
    console.log(`\n${colors.fg.cyan}Abriendo api-test.html...${colors.reset}`);
    try {
      // En Windows
      if (process.platform === 'win32') {
        execSync('start frontend/api-test.html', { cwd: __dirname });
      }
      // En macOS
      else if (process.platform === 'darwin') {
        execSync('open frontend/api-test.html', { cwd: __dirname });
      }
      // En Linux
      else {
        execSync('xdg-open frontend/api-test.html', { cwd: __dirname });
      }
      
      console.log(`${colors.fg.green}✅ Archivo api-test.html abierto correctamente${colors.reset}`);
      console.log(`${colors.fg.yellow}Por favor, verifica manualmente la conectividad en el navegador${colors.reset}`);
    } catch (error) {
      console.error(`${colors.fg.red}❌ No se pudo abrir api-test.html: ${error.message}${colors.reset}`);
      console.log(`${colors.fg.yellow}Puedes abrir manualmente el archivo en: ${path.join(__dirname, 'frontend', 'api-test.html')}${colors.reset}`);
    }
  } else {
    console.log(`${colors.fg.yellow}Omitiendo verificación de conectividad${colors.reset}`);
  }
}

// Función para mostrar información de Render
async function showRenderInfo(rl) {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== INFORMACIÓN DE RENDER ===${colors.reset}`);
  
  const answer = await question(rl, `\n${colors.fg.yellow}¿Deseas ver la información de Render? (s/n): ${colors.reset}`);
  
  if (answer.toLowerCase() === 's') {
    runCommand('cd backend && node renderInfo.js', 'Información de Render');
  } else {
    console.log(`${colors.fg.yellow}Omitiendo información de Render${colors.reset}`);
  }
}

// Función para verificar la base de datos
async function checkDatabase(rl) {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== VERIFICANDO BASE DE DATOS ===${colors.reset}`);
  
  const answer = await question(rl, `\n${colors.fg.yellow}¿Deseas verificar la conexión a la base de datos? (s/n): ${colors.reset}`);
  
  if (answer.toLowerCase() === 's') {
    runCommand('cd backend && node checkDbConnection.js', 'Verificación de conexión a base de datos');
  } else {
    console.log(`${colors.fg.yellow}Omitiendo verificación de base de datos${colors.reset}`);
  }
}

// Función para mostrar recomendaciones finales
function showRecommendations(results) {
  console.log(`\n${colors.bright}${colors.fg.yellow}=== RECOMENDACIONES FINALES ===${colors.reset}`);
  
  // Verificar si hay errores en los resultados
  const hasErrors = results.some(result => !result.success);
  
  if (hasErrors) {
    console.log(`\n${colors.fg.red}Se encontraron problemas en la verificación. Recomendaciones:${colors.reset}`);
    
    results.forEach(result => {
      if (!result.success) {
        console.log(`\n${colors.fg.yellow}Problema en: ${result.description}${colors.reset}`);
        console.log(`${colors.fg.white}Revisa los errores y soluciona los problemas antes de desplegar.${colors.reset}`);
      }
    });
  } else {
    console.log(`\n${colors.fg.green}¡Todo parece estar en orden! Recomendaciones para el despliegue:${colors.reset}`);
  }
  
  console.log(`\n${colors.fg.cyan}1. Asegúrate de que todos los cambios estén confirmados en Git${colors.reset}`);
  console.log(`${colors.fg.cyan}2. Sube los cambios a GitHub: git push origin master${colors.reset}`);
  console.log(`${colors.fg.cyan}3. Crea una cuenta en Render.com si aún no tienes una${colors.reset}`);
  console.log(`${colors.fg.cyan}4. Conecta tu repositorio de GitHub a Render${colors.reset}`);
  console.log(`${colors.fg.cyan}5. Despliega tu aplicación siguiendo las instrucciones en DEPLOY_RENDER.md${colors.reset}`);
  console.log(`${colors.fg.cyan}6. Verifica que la aplicación funcione correctamente en Render${colors.reset}`);
  
  console.log(`\n${colors.fg.yellow}Para más información, consulta la documentación en DEPLOY_RENDER.md${colors.reset}`);
}

// Función principal
async function verifyRenderDeployment() {
  console.log(`\n${colors.bright}${colors.fg.cyan}==================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}=== VERIFICACIÓN DE DESPLIEGUE EN RENDER ===${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}==================================================${colors.reset}`);
  console.log(`\n${colors.fg.white}Fecha y hora: ${new Date().toISOString()}${colors.reset}`);
  
  // Crear interfaz de línea de comandos
  const rl = createInterface();
  
  try {
    // Verificar archivos críticos
    const fileResults = checkCriticalFiles();
    
    // Verificar configuración de Render
    const renderConfigOk = checkRenderConfig();
    
    // Si faltan archivos críticos, preguntar si continuar
    if (fileResults.missingFiles > 0 || fileResults.missingScripts > 0 || !renderConfigOk) {
      const answer = await question(rl, `\n${colors.fg.red}Se encontraron problemas. ¿Deseas continuar con la verificación? (s/n): ${colors.reset}`);
      
      if (answer.toLowerCase() !== 's') {
        console.log(`\n${colors.fg.yellow}Verificación cancelada por el usuario.${colors.reset}`);
        rl.close();
        return;
      }
    }
    
    // Ejecutar scripts de verificación
    const scriptResults = await runVerificationScripts(rl);
    
    // Verificar la base de datos
    await checkDatabase(rl);
    
    // Verificar conectividad entre frontend y backend
    await checkConnectivity(rl);
    
    // Mostrar información de Render
    await showRenderInfo(rl);
    
    // Mostrar recomendaciones finales
    showRecommendations(scriptResults);
    
    console.log(`\n${colors.bright}${colors.fg.green}=== VERIFICACIÓN COMPLETADA ===${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.fg.red}Error durante la verificación: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
}

// Ejecutar la verificación
verifyRenderDeployment();