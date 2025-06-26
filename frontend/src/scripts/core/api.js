// Cliente API para comunicación con el backend
class ApiClient {
  constructor(baseURL = "http://localhost:8000") {
    this.baseURL = baseURL;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Agregar más métodos según sea necesario (PUT, DELETE, etc.)
}

export const api = new ApiClient();