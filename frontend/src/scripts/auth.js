document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: email,
                    password: password,
                    grant_type: 'password'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Credenciales incorrectas');
            }

            const { access_token } = await response.json();
            
            // Guardar token y redirigir
            localStorage.setItem('auth_token', access_token);
            window.location.href = '/dashboard';
            
        } catch (error) {
            errorMessage.textContent = error.message;
            console.error('Login error:', error);
        }
    });
});