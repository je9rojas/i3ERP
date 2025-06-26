// Servicio de autenticación
import { api } from './api.js';

export class AuthService {
  static async login(email, password) {
    try {
      const response = await api.post('/api/auth/token', {
        username: email,
        password: password
      });
      
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  static logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  static isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  static getToken() {
    return localStorage.getItem('auth_token');
  }
}