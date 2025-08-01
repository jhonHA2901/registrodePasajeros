// Importar la configuración de la API
const API_URL = getApiUrl();

// Elementos del DOM
const registroForm = document.getElementById('registro-form');
const nombreInput = document.getElementById('nombre');
const dniInput = document.getElementById('dni');
const correoInput = document.getElementById('correo');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
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

// Manejar el envío del formulario de registro
async function handleRegistro(event) {
    event.preventDefault();
    
    const nombre = nombreInput.value.trim();
    const dni = dniInput.value.trim();
    const correo = correoInput.value.trim();
    const contraseña = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validaciones básicas
    if (nombre.length < 3) {
        showAlert('El nombre debe tener al menos 3 caracteres');
        return;
    }
    
    if (!/^\d{8}$/.test(dni)) {
        showAlert('El DNI debe contener 8 dígitos numéricos');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        showAlert('Ingrese un correo electrónico válido');
        return;
    }
    
    if (contraseña.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (contraseña !== confirmPassword) {
        showAlert('Las contraseñas no coinciden');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, dni, correo, contraseña })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al registrar usuario');
        }
        
        // Mostrar mensaje de éxito
        showAlert('Usuario registrado correctamente. Redirigiendo al login...', 'success');
        
        // Redirigir al login después de un breve retraso
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        showAlert(error.message);
        console.error('Error de registro:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión al cargar la página
    checkSession();
    
    // Listener para el formulario de registro
    registroForm.addEventListener('submit', handleRegistro);
});