import { AuthService } from './core/auth.js';
import { Dashboard } from './modules/dashboard/dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  
  // Redirigir solo si es necesario
  if (['/', '/dashboard'].includes(currentPath) && !AuthService.isAuthenticated()) {
    AuthService.redirectToLogin();
    return;
  }
  
  // Inicializar dashboard solo en rutas específicas
  if (currentPath === '/' || currentPath === '/dashboard') {
    Dashboard.init();
  }
  
  // No intentar inicializar componentes de login en otras páginas
});