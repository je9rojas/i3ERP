// frontend/src/scripts/modules/dashboard/dashboard.js
import { api } from '../../core/api.js';
import { formatCurrency } from '../../core/utils.js';

export class Dashboard {
    static async loadDashboardData() {
        try {
            const data = await api.get('/api/dashboard/stats');
            
            // Actualizar la UI con los datos
            document.getElementById('total-sales').textContent = formatCurrency(data.total_sales);
            document.getElementById('new-orders').textContent = data.new_orders;
            document.getElementById('pending-tasks').textContent = data.pending_tasks;
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    static init() {
        this.loadDashboardData();
        // Inicializar otros componentes del dashboard
    }
}

// Inicializar cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});