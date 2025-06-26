document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
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

                const data = await response.json();  // Recibe todos los datos
                
                // Guardar token y datos de usuario
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('user_email', data.email);
                localStorage.setItem('user_name', data.full_name);
                
                // Redirigir al dashboard
                window.location.href = '/dashboard';
                
            } catch (error) {
                errorMessage.textContent = error.message;
                console.error('Login error:', error);
            }
        });
    }
});