document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si ya está autenticado
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            const userResponse = await fetch('http://localhost:8000/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                // Mostrar datos del usuario en lugar de la página de inicio
                document.getElementById('content').innerHTML = `
                    <div class="user-welcome">
                        <h2>Bienvenido, ${userData.full_name}</h2>
                        <p>Rol: ${userData.role}</p>
                        <p>Email: ${userData.email}</p>
                        <button id="logoutBtn" class="logout-btn">Cerrar Sesión</button>
                    </div>
                `;
                
                document.getElementById('logoutBtn').addEventListener('click', () => {
                    localStorage.removeItem('auth_token');
                    window.location.href = '/';
                });
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
        }
    }

    // Manejar el botón de login
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/login';
        });
    }
});