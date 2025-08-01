// Importar la configuración de la API
const API_URL = getApiUrl();

// Elementos del DOM
const loginForm = document.getElementById('login-form');
const dniInput = document.getElementById('dni');
const passwordInput = document.getElementById('password');
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

// Verificar si hay un usuario en sesión
function checkSession() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        // Redirigir según el rol
        if (user.rol === 'admin') {
            window.location.href = 'home_admin.html';
        } else {
            window.location.href = 'home_pasajero.html';
        }
    }
}

// Manejar el envío del formulario de login
async function handleLogin(event) {
    event.preventDefault();
    
    const dni = dniInput.value.trim();
    const contraseña = passwordInput.value;
    
    // Validar formato de DNI (8 dígitos)
    if (!/^\d{8}$/.test(dni)) {
        showAlert('El DNI debe contener 8 dígitos numéricos');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni, contraseña })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        
        // Guardar datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Mostrar mensaje de éxito
        showAlert('Inicio de sesión exitoso. Redirigiendo...', 'success');
        
        // Redirigir según el rol del usuario
        setTimeout(() => {
            if (data.user.rol === 'admin') {
                window.location.href = 'home_admin.html';
            } else {
                window.location.href = 'home_pasajero.html';
            }
        }, 1000);
        
    } catch (error) {
        showAlert(error.message);
        console.error('Error de login:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión al cargar la página
    checkSession();
    
    // Listener para el formulario de login
    loginForm.addEventListener('submit', handleLogin);
});