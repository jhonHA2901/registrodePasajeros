// Configuración de la URL base de la API
const API_URL = 'http://localhost:3000/api';

// Elementos del DOM
const selectorPasajeroCard = document.getElementById('selector-pasajero-card');
const pasajeroSelect = document.getElementById('pasajero-select');
const verHistorialBtn = document.getElementById('ver-historial-btn');
const historialTitle = document.getElementById('historial-title');
const historialTableBody = document.getElementById('historial-table-body');
const refreshBtn = document.getElementById('refresh-btn');
const logoutLink = document.getElementById('logout-link');
const alertContainer = document.getElementById('alert-container');
const sidebarMenu = document.getElementById('sidebar-menu');
const panelType = document.getElementById('panel-type');

// Variables globales
let currentUser = null;
let selectedPasajeroId = null;

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

// Verificar sesión y configurar interfaz según rol
function checkSession() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        // No hay sesión, redirigir al login
        window.location.href = 'index.html';
        return false;
    }
    
    currentUser = JSON.parse(userData);
    
    // Configurar interfaz según rol
    if (currentUser.rol === 'admin') {
        // Es admin, mostrar selector de pasajero
        panelType.textContent = 'Panel de Administración';
        selectorPasajeroCard.style.display = 'block';
        historialTitle.textContent = 'Historial de Viajes del Pasajero';
        
        // Configurar menú lateral para admin
        sidebarMenu.innerHTML = `
            <li class="nav-item">
                <a href="home_admin.html" class="nav-link">
                    <i class="bi bi-people me-2"></i> Pasajeros
                </a>
            </li>
            <li class="nav-item">
                <a href="rutas.html" class="nav-link">
                    <i class="bi bi-map me-2"></i> Gestión de Rutas
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link" id="logout-link">
                    <i class="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                </a>
            </li>
        `;
        
        // Cargar lista de pasajeros para el selector
        loadPasajeros();
    } else {
        // Es pasajero, mostrar su propio historial
        panelType.textContent = 'Panel de Pasajero';
        selectorPasajeroCard.style.display = 'none';
        historialTitle.textContent = 'Mi Historial de Viajes';
        
        // Configurar menú lateral para pasajero
        sidebarMenu.innerHTML = `
            <li class="nav-item">
                <a href="home_pasajero.html" class="nav-link">
                    <i class="bi bi-map me-2"></i> Rutas Disponibles
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link active">
                    <i class="bi bi-clock-history me-2"></i> Mi Historial
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link" id="logout-link">
                    <i class="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                </a>
            </li>
        `;
        
        // Cargar historial del pasajero actual
        loadHistorial(currentUser.id);
    }
    
    // Actualizar el listener para cerrar sesión
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    return true;
}

// Cargar lista de pasajeros (solo para admin)
async function loadPasajeros() {
    if (currentUser.rol !== 'admin') return;
    
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        
        if (!response.ok) {
            throw new Error('Error al cargar pasajeros');
        }
        
        const pasajeros = await response.json();
        
        // Filtrar solo pasajeros (no admins)
        const soloUsuarios = pasajeros.filter(p => p.rol === 'pasajero');
        
        // Limpiar selector
        pasajeroSelect.innerHTML = '<option value="">Seleccione un pasajero...</option>';
        
        // Llenar selector con opciones
        soloUsuarios.forEach(pasajero => {
            pasajeroSelect.innerHTML += `
                <option value="${pasajero.id}">${pasajero.nombre} (${pasajero.dni})</option>
            `;
        });
        
        // Verificar si hay un ID en la URL (para cargar directamente)
        const urlParams = new URLSearchParams(window.location.search);
        const pasajeroId = urlParams.get('id');
        
        if (pasajeroId) {
            pasajeroSelect.value = pasajeroId;
            selectedPasajeroId = pasajeroId;
            loadHistorial(pasajeroId);
        }
        
    } catch (error) {
        console.error('Error al cargar pasajeros:', error);
        showAlert('Error al cargar la lista de pasajeros');
    }
}

// Cargar historial de un pasajero
async function loadHistorial(userId) {
    try {
        const response = await fetch(`${API_URL}/historial/${userId}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar historial');
        }
        
        const historial = await response.json();
        
        // Limpiar tabla
        historialTableBody.innerHTML = '';
        
        if (historial.length === 0) {
            historialTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No hay registros en el historial</td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla con datos
        historial.forEach(registro => {
            historialTableBody.innerHTML += `
                <tr>
                    <td>${registro.id}</td>
                    <td>${new Date(registro.fecha_registro).toLocaleDateString()}</td>
                    <td>${registro.origen}</td>
                    <td>${registro.destino}</td>
                </tr>
            `;
        });
        
    } catch (error) {
        console.error('Error al cargar historial:', error);
        showAlert('Error al cargar el historial de viajes');
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión y configurar interfaz
    if (!checkSession()) return;
    
    // Listener para el botón de ver historial (solo para admin)
    if (verHistorialBtn) {
        verHistorialBtn.addEventListener('click', () => {
            selectedPasajeroId = pasajeroSelect.value;
            
            if (!selectedPasajeroId) {
                showAlert('Debe seleccionar un pasajero');
                return;
            }
            
            loadHistorial(selectedPasajeroId);
        });
    }
    
    // Listener para el botón de actualizar
    refreshBtn.addEventListener('click', () => {
        if (currentUser.rol === 'admin' && selectedPasajeroId) {
            loadHistorial(selectedPasajeroId);
        } else if (currentUser.rol !== 'admin') {
            loadHistorial(currentUser.id);
        }
    });
});