// auth.js - Manejo centralizado de autenticación
console.log("[Auth] auth.js cargado");

const AuthService = {
    setToken: (token) => {
        console.log("[Auth] Guardando token en localStorage:", token);
        localStorage.setItem('auth_token', token);
        console.log("[Auth] Token almacenado correctamente. Verificar localStorage: ", localStorage.getItem('auth_token'));
    },
    
    getToken: () => {
        const token = localStorage.getItem('auth_token');
        console.log(`[Auth] Obteniendo token: ${token ? "Existe" : "No existe"}`);
        return token;
    },
    
    clearToken: () => {
        console.log("[Auth] Eliminando token");
        localStorage.removeItem('auth_token');
        console.log("[Auth] Token eliminado. Verificación: ", localStorage.getItem('auth_token') || "Ninguno");
    },
    
    isAuthenticated: async () => {
        console.log("[Auth] Verificando autenticación");
        const token = AuthService.getToken();
        
        if (!token) {
            console.log("[Auth] No hay token - Usuario no autenticado");
            return false;
        }
        
        try {
            console.log("[Auth] Verificando token con el servidor...");
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log(`[Auth] Respuesta de verificación: ${response.status}`);
            
            if (response.ok) {
                console.log("[Auth] Token válido - Usuario autenticado");
                return true;
            } else {
                console.warn(`[Auth] Token inválido - Error ${response.status}`);
                // Agregar más detalles del error
                const errorText = await response.text();
                console.error(`[Auth] Detalles del error: ${errorText}`);
                return false;
            }
        } catch (error) {
            console.error('[Auth] Error en verificación:', error);
            return false;
        }
    },
    
    handleLogin: async (email, password) => {
        console.log(`[Auth] Iniciando login para: ${email}`);
        try {
            console.log("[Auth] Enviando solicitud de login...");
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            console.log(`[Auth] Respuesta recibida: ${response.status}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("[Auth] Error en login:", errorData);
                throw new Error(errorData.detail || 'Error en credenciales');
            }
            
            const data = await response.json();
            console.log("[Auth] Login exitoso. Datos recibidos:", data);
            
            if (!data.access_token) {
                console.error("[Auth] No se recibió access_token en la respuesta");
                throw new Error("Token no recibido en la respuesta");
            }
            
            AuthService.setToken(data.access_token);
            console.log("[Auth] Token guardado. Login completado.");
            return data;  // Devuelve todos los datos por si necesitas más información
            
        } catch (error) {
            console.error('[Auth] Error en login:', error);
            throw error;
        }
    }
};

// Inicialización de eventos de autenticación
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Auth] DOM cargado. Inicializando eventos...");
    
    // 1. Manejar formulario de login si existe
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log("[Auth] Formulario de login encontrado");
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("[Auth] Formulario enviado");
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const result = await AuthService.handleLogin(email, password);
                console.log("[Auth] Redirigiendo a dashboard...");
                
                // Agregar parámetro para identificar redirección exitosa
                window.location.href = '/dashboard?auth=success&source=login';
                
            } catch (error) {
                console.error('[Auth] Error en submit:', error);
                showNotification(`Error: ${error.message}`, 'error');
            }
        });
    } else {
        console.log("[Auth] No se encontró formulario de login");
    }
    
    // 2. Manejar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log("[Auth] Botón de logout encontrado");
        logoutBtn.addEventListener('click', () => {
            AuthService.clearToken();
            window.location.href = '/';
        });
    }
    
    // 3. Verificar autenticación en páginas protegidas - MODIFICADO
    const protectedPaths = ['/dashboard', '/otra-ruta-protegida'];
    const currentPath = window.location.pathname;
    
    if (protectedPaths.includes(currentPath)) {
        console.log(`[Auth] Verificando autenticación para ruta protegida: ${currentPath}...`);
        
        // Agregar retardo para dar tiempo al almacenamiento del token
        setTimeout(async () => {
            const isAuth = await AuthService.isAuthenticated();
            console.log(`[Auth] Resultado verificación: ${isAuth}`);
            
            if (!isAuth) {
                console.warn("[Auth] Usuario no autenticado - Redirigiendo a login");
                window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
            } else {
                console.log("[Auth] Usuario autenticado - Acceso permitido");
            }
        }, 100);  // Pequeño retardo para sincronización
    }
});

// Función global para notificaciones
function showNotification(message, type = 'info') {
    console.log(`[Notification] Mostrando: ${message} (${type})`);
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1000';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    
    // Auto-eliminación después de 5 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}