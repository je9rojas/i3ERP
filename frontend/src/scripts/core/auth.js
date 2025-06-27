export class AuthService {
  static getToken() {
    return localStorage.getItem('auth_token');
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static redirectToLogin() {
    window.location.href = '/login';
  }

  static async login(username, password) {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username,
          password,
          grant_type: 'password'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciales inválidas');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
}