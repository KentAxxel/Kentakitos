const GOOGLE_CLIENT_ID = '989537141024-jp3rsqdgiu3smtsfv9vv6q859fat5j61.apps.googleusercontent.com';

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const loading = document.getElementById('loading');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    await loginTraditional(username, password);
});

async function loginTraditional(username, password) {
    showLoading(true);
    clearMessages();

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error de autenticación');
        }

        const data = await response.json();
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        showSuccess('¡Autenticación exitosa! Redirigiendo...');
        setTimeout(() => window.location.href = '/index.html', 1000);
    } catch (error) {
        showError('Error: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function handleGoogleCallback(response) {
    if (!response.credential) {
        showError('Error: No se recibió el token de Google');
        return;
    }

    authenticateWithGoogle(response.credential);
}

async function triggerGoogleSignIn() {
    if (!window.google?.accounts?.id) {
        showError('Google Identity Services no está disponible');
        return;
    }

    google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { theme: 'outline', size: 'large' }
    );

    document.querySelector('[data-google-signin-button]')?.click();
}

async function authenticateWithGoogle(idToken) {
    showLoading(true);
    clearMessages();

    try {
        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error de autenticación con Google');
        }

        const data = await response.json();
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        showSuccess('¡Autenticación con Google exitosa! Redirigiendo...');
        setTimeout(() => window.location.href = '/index.html', 1000);
    } catch (error) {
        showError('Error al autenticar con Google: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
    if (message.includes("Ya existe una sesión activa")) {
        alert(message);
    }
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
}

function clearMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Elimina por completo la función triggerGoogleSignIn() ya que no la necesitaremos.

window.addEventListener('load', () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        window.location.href = '/index.html';
        return; // Detener la ejecución si ya está logueado
    }

    // Configurar e inicializar el botón apenas cargue la página
    if (window.google?.accounts?.id) {
        // 1. Inicializar las credenciales de Google
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback
        });

        // 2. Renderizar automáticamente el botón oficial en nuestro DIV
        google.accounts.id.renderButton(
            document.getElementById('googleBtn'),
            { 
                theme: 'outline', 
                size: 'large',
                width: 320 // Ajusta este ancho para que se acople bien a tu contenedor Kentakitos
            }
        );
    } else {
        // En caso de que falle la carga del script externo de Google
        console.error('Google Identity Services no está disponible');
    }
});