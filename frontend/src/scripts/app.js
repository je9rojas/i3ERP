// Punto de entrada principal de la aplicación
import { AuthService } from './core/auth.js';
import { Dashboard } from './modules/dashboard/dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  if (!AuthService.isAuthenticated() && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return;
  }
  
  // Inicializar módulos según la página actual
  switch (window.location.pathname) {
    case '/':
    case '/dashboard':
      Dashboard.init();
      break;
      
    case '/login':
      // Inicializar lógica de login si es necesario
      break;
      
    // Agregar más casos según sea necesario
  }
});