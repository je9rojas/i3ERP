// auth.js - Manejo centralizado de autenticación
console.log("[Auth] auth.js cargado");

const AuthService = {
    setToken: (token) => {
        console.log("[Auth] Guardando token en localStorage:", token);
        localStorage.setItem('auth_token', token);
        console.log("[Auth] Token almacenado. Verificación: ", localStorage.getItem('auth_token'));
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
    
    isTokenExpired: (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp;
            return Math.floor(Date.now() / 1000) >= expiry;
        } catch (e) {
            console.error("[Auth] Error verificando expiración:", e);
            return true;
        }
    },
    
    isAuthenticated: async () => {
        console.log("[Auth] Verificando autenticación");
        const token = AuthService.getToken();
        
        if (!token || AuthService.isTokenExpired(token)) {
            console.log("[Auth] Token no existe o expirado");
            return false;
        }
        
        try {
            console.log("[Auth] Verificando token con el servidor...");
            const response = await fetch('/api/auth/me', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            
            console.log(`[Auth] Respuesta de verificación: ${response.status}`);
            
            if (response.ok) {
                console.log("[Auth] Token válido - Usuario autenticado");
                return true;
            } else {
                console.warn(`[Auth] Token inválido - Error ${response.status}`);
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
                headers: {'Content-Type': 'application/json'},
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
                console.error("[Auth] No se recibió access_token");
                throw new Error("Token no recibido en la respuesta");
            }
            
            AuthService.setToken(data.access_token);
            console.log("[Auth] Token guardado. Login completado.");
            return data;
            
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
                console.log("[Auth] Login exitoso. Redirigiendo...");
                window.location.href = '/dashboard?auth=success';
            } catch (error) {
                console.error('[Auth] Error en submit:', error);
                showNotification(`Error: ${error.message}`, 'error');
            }
        });
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
    
    // 3. Verificar autenticación en páginas protegidas
    const protectedPaths = ['/dashboard', '/products', '/sales', '/inventory', '/users'];
    const currentPath = window.location.pathname;
    
    if (protectedPaths.includes(currentPath)) {
        console.log(`[Auth] Verificando autenticación para: ${currentPath}`);
        
        try {
            const isAuth = await AuthService.isAuthenticated();
            console.log(`[Auth] Resultado verificación: ${isAuth}`);
            
            if (!isAuth) {
                console.warn("[Auth] Usuario no autenticado - Redirigiendo a login");
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            } else {
                console.log("[Auth] Usuario autenticado - Acceso permitido");
            }
        } catch (error) {
            console.error("[Auth] Error en verificación:", error);
            window.location.href = '/login';
        }
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