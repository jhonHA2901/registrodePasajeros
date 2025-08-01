// Importar la configuración de la API
const API_URL = getApiUrl();

// Elementos del DOM
const pasajerosTableBody = document.getElementById('pasajeros-table-body');
const registrosTableBody = document.getElementById('registros-table-body');
const refreshBtn = document.getElementById('refresh-btn');
const logoutLink = document.getElementById('logout-link');

// Función para mostrar alertas
function showAlert(message, type = 'danger') {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '1050';
    
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Auto-cerrar la alerta después de 5 segundos
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alertContainer.remove(), 300);
        }
    }, 5000);
}

// Verificar si hay un usuario admin en sesión
function checkAdminSession() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        // No hay sesión, redirigir al login
        window.location.href = 'index.html';
        return false;
    }
    
    const user = JSON.parse(userData);
    if (user.rol !== 'admin') {
        // No es admin, redirigir al panel de pasajero
        window.location.href = 'home_pasajero.html';
        return false;
    }
    
    return true;
}

// Cargar lista de pasajeros
async function loadPasajeros() {
    try {
        // En una implementación real, esta sería una ruta protegida que requiere autenticación
        // Aquí simulamos enviando el rol en el cuerpo para pruebas
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // Aquí iría el token de autenticación en una implementación real
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar pasajeros');
        }
        
        const pasajeros = await response.json();
        
        // Limpiar tabla
        pasajerosTableBody.innerHTML = '';
        
        // Mostrar solo pasajeros (no admins)
        const soloUsuarios = pasajeros.filter(p => p.rol === 'pasajero');
        
        if (soloUsuarios.length === 0) {
            pasajerosTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay pasajeros registrados</td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla con datos
        soloUsuarios.forEach(pasajero => {
            pasajerosTableBody.innerHTML += `
                <tr>
                    <td>${pasajero.id}</td>
                    <td>${pasajero.nombre}</td>
                    <td>${pasajero.dni}</td>
                    <td>${pasajero.correo}</td>
                    <td>
                        <a href="historial.html?id=${pasajero.id}" class="btn btn-sm btn-info">
                            <i class="bi bi-clock-history"></i> Ver Historial
                        </a>
                    </td>
                </tr>
            `;
        });
        
    } catch (error) {
        console.error('Error al cargar pasajeros:', error);
        showAlert('Error al cargar la lista de pasajeros');
    }
}

// Cargar registros recientes
async function loadRegistros() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/registros`, {
            method: 'POST', // Usamos POST para enviar el rol en el cuerpo
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rol: user.rol })
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar registros');
        }
        
        const registros = await response.json();
        
        // Limpiar tabla
        registrosTableBody.innerHTML = '';
        
        if (registros.length === 0) {
            registrosTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No hay registros disponibles</td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla con datos
        registros.forEach(registro => {
            registrosTableBody.innerHTML += `
                <tr>
                    <td>${registro.id}</td>
                    <td>${registro.nombre_usuario} (${registro.dni})</td>
                    <td>${registro.origen} → ${registro.destino}</td>
                    <td>${new Date(registro.fecha_registro).toLocaleDateString()}</td>
                </tr>
            `;
        });
        
    } catch (error) {
        console.error('Error al cargar registros:', error);
        showAlert('Error al cargar los registros recientes');
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Cargar datos iniciales
async function loadInitialData() {
    if (!checkAdminSession()) return;
    
    try {
        await Promise.all([
            loadPasajeros(),
            loadRegistros()
        ]);
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        showAlert('Error al cargar los datos');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión y cargar datos
    loadInitialData();
    
    // Listener para el botón de actualizar
    refreshBtn.addEventListener('click', loadInitialData);
    
    // Listener para cerrar sesión
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});