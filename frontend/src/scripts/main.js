// main.js - Punto de entrada principal
console.log("[Main] main.js cargado");

// Importar módulo de autenticación
import './modules/auth.js';

// Código para la página principal
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOM cargado");
    
    // Solo se ejecuta en la página principal (index.html)
    if (window.location.pathname === '/') {
        console.log("[Main] En página principal");
        const token = localStorage.getItem('auth_token');
        console.log(`[Main] Token en localStorage: ${token ? "EXISTE" : "NO EXISTE"}`);
        
        if (token) {
            console.log("[Main] Token encontrado - Obteniendo datos de usuario");
            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log(`[Main] Respuesta de /api/auth/me: ${response.status}`);
                
                if (response.ok) {
                    const userData = await response.json();
                    console.log("[Main] Datos de usuario recibidos:", userData);
                    
                    // Actualizar UI con datos del usuario
                    const mainElement = document.querySelector('main');
                    if (mainElement) {
                        mainElement.innerHTML = `
                            <div class="user-welcome">
                                <h2>Bienvenido, ${userData.full_name}</h2>
                                <p>Rol: ${userData.role}</p>
                                <p>Email: ${userData.email}</p>
                                <button id="logoutBtn" class="logout-btn">Cerrar Sesión</button>
                            </div>
                        `;
                        
                        // Agregar evento al botón de logout
                        document.getElementById('logoutBtn').addEventListener('click', () => {
                            localStorage.removeItem('auth_token');
                            window.location.href = '/';
                        });
                    }
                }
            } catch (error) {
                console.error('[Main] Error cargando datos de usuario:', error);
            }
        }
    }
});