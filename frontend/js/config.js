// Configuración global de la API
const API_CONFIG = {
    // Función para determinar si estamos en producción (Render)
    isProduction: function() {
        return window.location.hostname.includes('render.com') || 
               window.location.hostname.includes('onrender.com') ||
               !window.location.hostname.includes('localhost') && 
               !window.location.hostname.includes('127.0.0.1') && 
               !window.location.hostname.includes('192.168');
    },
    
    // URL base de la API según el entorno
    get BASE_URL() {
        if (this.isProduction()) {
            console.log('Entorno detectado: Producción (Render)');
            return 'https://registrop1-backend.onrender.com/api';
        } else {
            console.log('Entorno detectado: Desarrollo local');
            // Usar la IP local detectada en el navegador
            return 'http://' + window.location.hostname + ':3000/api';
        }
    }
};

// Exportar la configuración para que otros archivos la utilicen
function getApiUrl() {
    return API_CONFIG.BASE_URL;
}