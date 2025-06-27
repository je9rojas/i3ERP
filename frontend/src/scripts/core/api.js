import { AuthService } from './auth.js';

export const api = {
  async request(method, url, data) {
    const token = AuthService.getToken();
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      credentials: 'include',
      mode: 'cors'
    };

    if (data) {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      // Manejar errores de autenticación
      if (response.status === 401) {
        AuthService.redirectToLogin();
        throw new Error('No autorizado. Redirigiendo a login...');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API ${method} ${url} error:`, error);
      throw error;
    }
  },

  get(url) {
    return this.request('GET', url);
  },

  post(url, data) {
    return this.request('POST', url, data);
  }
};