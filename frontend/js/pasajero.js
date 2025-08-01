// Configuración de la URL base de la API
const API_URL = 'http://192.168.2.42:3000/api';

// Elementos del DOM
const userName = document.getElementById('user-name');
const rutasContainer = document.getElementById('rutas-container');
const historialTableBody = document.getElementById('historial-table-body');
const registrarBtn = document.getElementById('registrar-btn');
const refreshBtn = document.getElementById('refresh-btn');
const logoutLink = document.getElementById('logout-link');
const alertContainer = document.getElementById('alert-container');

// Variables globales
let selectedRutaId = null;
let currentUser = null;

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

// Verificar si hay un usuario pasajero en sesión
function checkPasajeroSession() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        // No hay sesión, redirigir al login
        window.location.href = 'index.html';
        return false;
    }
    
    const user = JSON.parse(userData);
    currentUser = user;
    
    // Mostrar nombre del usuario
    if (userName) {
        userName.textContent = user.nombre;
    }
    
    if (user.rol === 'admin') {
        // Es admin, redirigir al panel de admin
        window.location.href = 'home_admin.html';
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
        
        // Limpiar contenedor
        rutasContainer.innerHTML = '';
        
        if (rutas.length === 0) {
            rutasContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No hay rutas disponibles</p>
                </div>
            `;
            return;
        }
        
        // Mostrar rutas como tarjetas
        rutas.forEach(ruta => {
            rutasContainer.innerHTML += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card route-card" data-ruta-id="${ruta.id}">
                        <div class="card-body">
                            <h5 class="card-title">${ruta.origen} → ${ruta.destino}</h5>
                            <p class="card-text">
                                <strong>Origen:</strong> ${ruta.origen}<br>
                                <strong>Destino:</strong> ${ruta.destino}
                            </p>
                            <button class="btn btn-outline-primary btn-sm select-route-btn">
                                <i class="bi bi-check-circle me-1"></i> Seleccionar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Agregar event listeners a las tarjetas de rutas
        document.querySelectorAll('.route-card').forEach(card => {
            card.addEventListener('click', () => {
                // Deseleccionar todas las tarjetas
                document.querySelectorAll('.route-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Seleccionar la tarjeta actual
                card.classList.add('selected');
                
                // Guardar el ID de la ruta seleccionada
                selectedRutaId = card.dataset.rutaId;
                
                // Habilitar el botón de registrar
                registrarBtn.disabled = false;
            });
        });
        
    } catch (error) {
        console.error('Error al cargar rutas:', error);
        showAlert('Error al cargar las rutas disponibles');
    }
}

// Cargar historial del pasajero
async function loadHistorial() {
    try {
        const response = await fetch(`${API_URL}/historial/${currentUser.id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar historial');
        }
        
        const historial = await response.json();
        
        // Limpiar tabla
        historialTableBody.innerHTML = '';
        
        if (historial.length === 0) {
            historialTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">No hay registros en tu historial</td>
                </tr>
            `;
            return;
        }
        
        // Mostrar solo los últimos 5 registros
        const recentHistorial = historial.slice(0, 5);
        
        // Llenar tabla con datos
        recentHistorial.forEach(registro => {
            historialTableBody.innerHTML += `
                <tr>
                    <td>${new Date(registro.fecha_registro).toLocaleDateString()}</td>
                    <td>${registro.origen}</td>
                    <td>${registro.destino}</td>
                </tr>
            `;
        });
        
    } catch (error) {
        console.error('Error al cargar historial:', error);
        showAlert('Error al cargar tu historial de viajes');
    }
}

// Registrar una ruta
async function registrarRuta() {
    if (!selectedRutaId) {
        showAlert('Debes seleccionar una ruta primero');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: currentUser.id,
                ruta_id: selectedRutaId
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al registrar ruta');
        }
        
        // Mostrar mensaje de éxito
        showAlert('Ruta registrada correctamente', 'success');
        
        // Recargar historial
        await loadHistorial();
        
        // Deseleccionar ruta
        document.querySelectorAll('.route-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        selectedRutaId = null;
        registrarBtn.disabled = true;
        
    } catch (error) {
        console.error('Error al registrar ruta:', error);
        showAlert(error.message);
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Cargar datos iniciales
async function loadInitialData() {
    if (!checkPasajeroSession()) return;
    
    try {
        await Promise.all([
            loadRutas(),
            loadHistorial()
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
    
    // Listener para el botón de registrar
    registrarBtn.addEventListener('click', registrarRuta);
    
    // Listener para el botón de actualizar
    refreshBtn.addEventListener('click', loadInitialData);
    
    // Listener para cerrar sesión
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});