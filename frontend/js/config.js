// Configuración global de la API
const API_CONFIG = {
    // En producción (Render), la URL base será la URL del servicio backend
    // En desarrollo local, será la URL local
    BASE_URL: window.location.hostname.includes('render.com') || window.location.hostname.includes('onrender.com')
        ? 'https://registrop1-backend.onrender.com/api'
        : 'http://192.168.2.42:3000/api'
};

// Exportar la configuración para que otros archivos la utilicen
function getApiUrl() {
    return API_CONFIG.BASE_URL;
}