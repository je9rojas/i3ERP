// frontend/src/scripts/modules/auth/auth.js
import { AuthService } from '../../core/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const success = await AuthService.login(email, password);
            
            if (success) {
                window.location.href = '/';
            } else {
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = 'Credenciales incorrectas. Intente de nuevo.';
                errorMessage.classList.remove('d-none');
            }
        });
    }
});