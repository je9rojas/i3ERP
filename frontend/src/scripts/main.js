document.addEventListener('DOMContentLoaded', async () => {
    // Ejemplo de consumo de API
    try {
        const response = await fetch('http://localhost:8000/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: 'admin@example.com',
                password: 'password'
            })
        });
        
        const data = await response.json();
        console.log('Token de acceso:', data.access_token);
        
        // Usar el token para obtener datos del usuario
        const userResponse = await fetch('http://localhost:8000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });
        
        const userData = await userResponse.json();
        console.log('Datos del usuario:', userData);
        
        // Mostrar en la UI
        document.getElementById('content').innerHTML = `
            <h2>Bienvenido, ${userData.full_name}</h2>
            <p>Rol: ${userData.role}</p>
            <p>Email: ${userData.email}</p>
        `;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('content').innerHTML = `
            <div class="error">
                <h2>Error de conexión</h2>
                <p>No se pudo conectar con el servidor</p>
            </div>
        `;
    }
});