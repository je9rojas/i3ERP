// auth-service.js - Servicio de autenticación
const AuthService = {
    // Almacenar token en localStorage
    setToken: (token) => {
        localStorage.setItem('auth_token', token);
    },
    
    // Obtener token
    getToken: () => {
        return localStorage.getItem('auth_token');
    },
    
    // Eliminar token
    clearToken: () => {
        localStorage.removeItem('auth_token');
    },
    
    // Verificar autenticación
    isAuthenticated: async () => {
        const token = AuthService.getToken();
        if (!token) return false;
        
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    },
    
    // Iniciar sesión
    login: async (email, password) => {
        try {
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                AuthService.setToken(data.access_token);
                return { success: true };
            } else {
                const errorData = await response.json();
                return { 
                    success: false, 
                    message: errorData.detail || 'Credenciales inválidas' 
                };
            }
        } catch (error) {
            return { 
                success: false, 
                message: 'Error de conexión con el servidor' 
            };
        }
    },
    
    // Cerrar sesión
    logout: () => {
        AuthService.clearToken();
        window.location.href = '/login';
    }
};

export default AuthService;