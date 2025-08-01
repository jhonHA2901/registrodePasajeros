// Configuración de la URL base de la API
const API_URL = 'http://192.168.2.42:3000/api';

// Elementos del DOM
const nuevaRutaForm = document.getElementById('nueva-ruta-form');
const origenInput = document.getElementById('origen');
const destinoInput = document.getElementById('destino');
const rutasTableBody = document.getElementById('rutas-table-body');
const refreshBtn = document.getElementById('refresh-btn');
const logoutLink = document.getElementById('logout-link');
const alertContainer = document.getElementById('alert-container');

// Función para mostrar alertas
function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Auto-cerrar la alerta después de 5 segundos
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
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

// Cargar rutas disponibles
async function loadRutas() {
    try {
        const response = await fetch(`${API_URL}/rutas`);
        
        if (!response.ok) {
            throw new Error('Error al cargar rutas');
        }
        
        const rutas = await response.json();
        
        // Limpiar tabla
        rutasTableBody.innerHTML = '';
        
        if (rutas.length === 0) {
            rutasTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No hay rutas disponibles</td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla con datos
        rutas.forEach(ruta => {
            rutasTableBody.innerHTML += `
                <tr>
                    <td>${ruta.id}</td>
                    <td>${ruta.origen}</td>
                    <td>${ruta.destino}</td>
                    <td>
                        <button class="btn btn-sm btn-danger delete-ruta-btn" data-ruta-id="${ruta.id}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.delete-ruta-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const rutaId = btn.dataset.rutaId;
                if (confirm('¿Estás seguro de que deseas eliminar esta ruta?')) {
                    await deleteRuta(rutaId);
                }
            });
        });
        
    } catch (error) {
        console.error('Error al cargar rutas:', error);
        showAlert('Error al cargar las rutas disponibles');
    }
}

// Agregar nueva ruta
async function addRuta(event) {
    event.preventDefault();
    
    const origen = origenInput.value.trim();
    const destino = destinoInput.value.trim();
    
    if (!origen || !destino) {
        showAlert('Origen y destino son obligatorios');
        return;
    }
    
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/rutas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                origen,
                destino,
                rol: user.rol // Para verificación de permisos en el backend
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al agregar ruta');
        }
        
        // Limpiar formulario
        nuevaRutaForm.reset();
        
        // Mostrar mensaje de éxito
        showAlert('Ruta agregada correctamente', 'success');
        
        // Recargar lista de rutas
        await loadRutas();
        
    } catch (error) {
        console.error('Error al agregar ruta:', error);
        showAlert(error.message);
    }
}

// Eliminar ruta
async function deleteRuta(rutaId) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/rutas/${rutaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rol: user.rol // Para verificación de permisos en el backend
            })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al eliminar ruta');
        }
        
        // Mostrar mensaje de éxito
        showAlert('Ruta eliminada correctamente', 'success');
        
        // Recargar lista de rutas
        await loadRutas();
        
    } catch (error) {
        console.error('Error al eliminar ruta:', error);
        showAlert(error.message);
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión
    if (!checkAdminSession()) return;
    
    // Cargar rutas iniciales
    loadRutas();
    
    // Listener para el formulario de nueva ruta
    nuevaRutaForm.addEventListener('submit', addRuta);
    
    // Listener para el botón de actualizar
    refreshBtn.addEventListener('click', loadRutas);
    
    // Listener para cerrar sesión
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});