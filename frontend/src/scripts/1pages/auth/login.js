// login.js - Controlador para la página de login
import AuthService from '../../features/auth/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await AuthService.login(email, password);
            
            if (response.success) {
                window.location.href = '/dashboard?auth=success';
            } else {
                showError(response.message || 'Credenciales inválidas');
            }
        } catch (error) {
            console.error('Error en login:', error);
            showError('Error de conexión con el servidor');
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            errorMessage.classList.add('d-none');
        }, 5000);
    }
});