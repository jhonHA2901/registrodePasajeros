/**
 * Script para verificar la conectividad con el backend API
 * Este script se puede incluir temporalmente en el frontend para diagnosticar problemas
 */

// Función autoejecutable para evitar contaminar el espacio global
(function() {
  // Crear un contenedor para los resultados
  const createDiagnosticPanel = () => {
    const panel = document.createElement('div');
    panel.id = 'api-diagnostic-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '10px';
    panel.style.right = '10px';
    panel.style.width = '400px';
    panel.style.maxHeight = '80vh';
    panel.style.overflowY = 'auto';
    panel.style.backgroundColor = '#f8f9fa';
    panel.style.border = '1px solid #dee2e6';
    panel.style.borderRadius = '4px';
    panel.style.padding = '15px';
    panel.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
    panel.style.zIndex = '9999';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';
    
    const title = document.createElement('h3');
    title.textContent = 'Diagnóstico de API';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.onclick = () => panel.remove();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    
    const content = document.createElement('div');
    content.id = 'api-diagnostic-content';
    panel.appendChild(content);
    
    const footer = document.createElement('div');
    footer.style.marginTop = '10px';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Reintentar';
    retryBtn.style.padding = '5px 10px';
    retryBtn.style.backgroundColor = '#007bff';
    retryBtn.style.color = 'white';
    retryBtn.style.border = 'none';
    retryBtn.style.borderRadius = '4px';
    retryBtn.style.cursor = 'pointer';
    retryBtn.onclick = () => checkApiConnection();
    
    footer.appendChild(retryBtn);
    panel.appendChild(footer);
    
    document.body.appendChild(panel);
    return content;
  };
  
  // Función para agregar un mensaje al panel
  const addMessage = (message, isError = false) => {
    const content = document.getElementById('api-diagnostic-content') || createDiagnosticPanel();
    const msgElement = document.createElement('div');
    msgElement.style.marginBottom = '5px';
    msgElement.style.padding = '5px';
    msgElement.style.borderLeft = `3px solid ${isError ? '#dc3545' : '#28a745'}`;
    msgElement.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    msgElement.textContent = message;
    content.appendChild(msgElement);
  };
  
  // Función para verificar la conexión con la API
  const checkApiConnection = async () => {
    const content = document.getElementById('api-diagnostic-content');
    if (content) content.innerHTML = '';
    
    // Obtener la URL de la API desde la configuración
    let apiUrl;
    try {
      apiUrl = getApiUrl ? getApiUrl() : 'API URL no disponible';
      addMessage(`URL de la API: ${apiUrl}`);
    } catch (error) {
      addMessage(`Error al obtener la URL de la API: ${error.message}`, true);
      return;
    }
    
    // Información del entorno
    addMessage(`Hostname: ${window.location.hostname}`);
    addMessage(`Protocolo: ${window.location.protocol}`);
    addMessage(`Entorno: ${window.location.hostname.includes('render.com') ? 'Producción (Render)' : 'Desarrollo local'}`);
    
    // Probar la conexión a la API
    try {
      addMessage('Probando conexión a la API...');
      const startTime = Date.now();
      const response = await fetch(`${apiUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        addMessage(`Conexión exitosa (${responseTime}ms): ${JSON.stringify(data)}`);
      } else {
        addMessage(`Error en la respuesta (${responseTime}ms): ${response.status} ${response.statusText}`, true);
      }
    } catch (error) {
      addMessage(`Error de conexión: ${error.message}`, true);
      addMessage('Posibles causas:', true);
      addMessage('- El backend no está en ejecución', true);
      addMessage('- La URL de la API es incorrecta', true);
      addMessage('- Hay problemas de CORS', true);
      addMessage('- Problemas de red', true);
    }
    
    // Verificar CORS
    addMessage('\nVerificando configuración CORS...');
    try {
      const response = await fetch(apiUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin
        }
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };
      
      addMessage(`Cabeceras CORS: ${JSON.stringify(corsHeaders)}`);
      
      if (corsHeaders['Access-Control-Allow-Origin']) {
        addMessage('Configuración CORS detectada');
      } else {
        addMessage('No se detectaron cabeceras CORS', true);
      }
    } catch (error) {
      addMessage(`Error al verificar CORS: ${error.message}`, true);
    }
  };
  
  // Iniciar la verificación cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkApiConnection);
  } else {
    checkApiConnection();
  }
})();