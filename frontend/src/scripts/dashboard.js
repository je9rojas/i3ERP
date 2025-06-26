/**
 * Dashboard Controller - Versión corregida
 * @version 1.1.0
 */

class DashboardController {
  constructor() {
    this.salesChart = null;
    this.init();
  }

  async init() {
    try {
      if (!await this.checkAuth()) return;
      
      await this.loadData();
      this.updateUI();
      this.setupChart();
      this.bindEvents();
      
      console.log('Dashboard inicializado correctamente');
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.redirectToLogin();
      return false;
    }
    return true;
  }

  async loadData() {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/dashboard/data', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      this.redirectToLogin();
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  updateUI(data) {
    this.updateMetrics(data);
    this.renderTopProducts(data.top_products);
    this.renderRecentSales(data.recent_sales);
    this.updateUserProfile();
  }

  updateMetrics(data) {
    const metrics = {
      '#total-sales': data.sales_today || 0,
      '#total-revenue': `$${(data.revenue_today || 0).toLocaleString()}`,
      '#low-stock': data.low_stock_items || 0,
      '#active-users': data.active_users || 0
    };

    Object.entries(metrics).forEach(([selector, value]) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = value;
        this.animateValue(element);
      } else {
        console.warn(`Elemento no encontrado: ${selector}`);
      }
    });
  }

  animateValue(element) {
    element.classList.add('value-updated');
    setTimeout(() => element.classList.remove('value-updated'), 500);
  }

  renderTopProducts(products = []) {
    const container = document.getElementById('top-products-list');
    if (!container) return;

    container.innerHTML = products.map(product => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0">${product.name}</h6>
          <small class="text-muted">${product.category}</small>
        </div>
        <span class="badge bg-primary rounded-pill">${product.sales} ventas</span>
      </li>
    `).join('');
  }

  renderRecentSales(sales = []) {
    const tbody = document.getElementById('recent-sales-body');
    if (!tbody) return;

    tbody.innerHTML = sales.map(sale => {
      const statusMap = {
        completed: { class: 'success', text: 'Completado' },
        pending: { class: 'warning', text: 'Pendiente' },
        cancelled: { class: 'danger', text: 'Cancelado' }
      };
      
      const status = statusMap[sale.status] || { class: 'secondary', text: sale.status };

      return `
        <tr>
          <td>${sale.id}</td>
          <td>${sale.customer}</td>
          <td>$${(sale.amount || 0).toLocaleString()}</td>
          <td><span class="badge bg-${status.class}">${status.text}</span></td>
          <td>${this.formatDate(sale.date)}</td>
        </tr>
      `;
    }).join('');
  }

  formatDate(dateString) {
    if (!dateString) return 'Hoy';
    
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString() 
      ? 'Hoy' 
      : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  setupChart(monthlyData = []) {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) {
      console.warn('Canvas del gráfico no encontrado');
      return;
    }

    // Destruir gráfico anterior de forma segura
    if (this.salesChart instanceof Chart) {
      this.salesChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Ventas Mensuales',
          data: monthlyData,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: this.getChartOptions()
    });
  }

  getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` $${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => `$$${value.toLocaleString()}` },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        },
        x: { grid: { display: false } }
      }
    };
  }

  updateUserProfile() {
    const userName = localStorage.getItem('user_name') || 'Administrador';
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = userName;
    });
  }

  bindEvents() {
    // Botón de logout
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });

    // Botón de refrescar
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Actualizando...';
        
        try {
          const data = await this.loadData();
          this.updateUI(data);
          this.setupChart(data.monthly_sales);
        } catch (error) {
          this.handleError(error);
        } finally {
          refreshBtn.disabled = false;
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
        }
      });
    }
  }

  logout() {
    localStorage.clear();
    this.redirectToLogin();
  }

  redirectToLogin() {
    window.location.href = '/login';
  }

  handleError(error) {
    console.error('Error en dashboard:', error);
    
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show">
          <strong>Error!</strong> ${error.message || 'Error al cargar datos'}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
    
    if (error.message.includes('401') || error.message.includes('Sesión')) {
      setTimeout(() => this.redirectToLogin(), 1500);
    }
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new DashboardController();
});