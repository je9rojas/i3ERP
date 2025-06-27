import { api } from '../../core/api.js';
import { formatCurrency } from '../../core/utils.js';
import { AuthService } from '../../core/auth.js';

export class Dashboard {
    static async loadDashboardData() {
        try {
            const data = await api.get('/api/dashboard/stats');
            
            // Verificar existencia de elementos antes de actualizar
            this.updateElement('sales-today', data.sales_today);
            this.updateElement('revenue-today', formatCurrency(data.revenue_today));
            this.updateElement('low-stock-items', data.low_stock_items);
            this.updateElement('active-users', data.active_users);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Error al cargar datos. Intente nuevamente.');
        }
    }

    static updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    static showError(message) {
        const errorElement = document.getElementById('dashboard-error');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            console.error("Elemento de error no encontrado:", message);
        }
    }

    static init() {
        if (document.querySelector('.dashboard-page')) {
            this.loadDashboardData();
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    AuthService.logout();
                });
            }
        }
    }
}