document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("[Dashboard] DOM completamente cargado");
        
        // 1. Referencias a elementos
        const salesValue = document.getElementById('total-sales-value');
        const revenueValue = document.getElementById('revenue-today-value');
        const lowStockValue = document.getElementById('low-stock-value');
        const activeUsersValue = document.getElementById('active-users-value');
        const salesChartCanvas = document.getElementById('salesChart');

        // 2. Verificar autenticación solo DESPUÉS de obtener referencias DOM
        const token = localStorage.getItem('auth_token');
        console.log("[Dashboard] Token encontrado:", token ? "Sí" : "No");
        
        if (!token) {
            console.warn("[Dashboard] Sin token - redirigiendo a login");
            window.location.href = '/login';
            return;
        }

        // 3. Validar elementos del dashboard
        if (!salesValue || !revenueValue || !lowStockValue || !activeUsersValue || !salesChartCanvas) {
            const missingElements = [
                !salesValue && 'total-sales-value',
                !revenueValue && 'revenue-today-value',
                !lowStockValue && 'low-stock-value',
                !activeUsersValue && 'active-users-value',
                !salesChartCanvas && 'salesChart'
            ].filter(Boolean);
            
            throw new Error(`Elementos del dashboard no encontrados: ${missingElements.join(', ')}`);
        }

        // 4. Cargar datos del dashboard
        console.log("[Dashboard] Solicitando datos...");
        const response = await fetch('/api/dashboard/data', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // 5. Manejar posibles errores de autenticación
        if (response.status === 401) {
            console.warn("[Dashboard] Token inválido - eliminando y redirigiendo");
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error en respuesta del servidor: ${response.status}`);
        }

        // 6. Procesar datos recibidos
        const data = await response.json();
        console.log("[Dashboard] Datos recibidos:", data);
        
        // 7. Actualizar métricas
        salesValue.textContent = data.sales_today;
        revenueValue.textContent = `$${data.revenue_today.toLocaleString()}`;
        lowStockValue.textContent = data.low_stock_items;
        activeUsersValue.textContent = data.active_users;

        // 8. Inicializar gráfico
        initializeSalesChart(salesChartCanvas, data);

    } catch (error) {
        console.error('[Dashboard] Error crítico:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
});

function initializeSalesChart(canvas, data) {
    try {
        console.log("[Dashboard] Inicializando gráfico...");
        
        // Destruir gráfico anterior si existe
        if (window.salesChartInstance) {
            console.log("[Dashboard] Destruyendo instancia anterior de gráfico");
            window.salesChartInstance.destroy();
        }

        // Crear nuevo gráfico
        const ctx = canvas.getContext('2d');
        window.salesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.sales_labels || ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Ventas Mensuales',
                    data: data.sales_data || [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Desempeño de Ventas'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log("[Dashboard] Gráfico inicializado correctamente");
        
    } catch (chartError) {
        console.error('[Dashboard] Error al inicializar gráfico:', chartError);
        showNotification('Error al cargar el gráfico de ventas', 'error');
    }
}

function showNotification(message, type = 'info') {
    try {
        // Implementación mejorada con Bootstrap
        const notificationContainer = document.getElementById('notification-container') || createNotificationContainer();
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        notificationContainer.appendChild(alert);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }, 5000);
        
    } catch (e) {
        console.error('Error al mostrar notificación:', e);
        // Fallback a alerta básica
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    container.style.width = '350px';
    document.body.appendChild(container);
    return container;
}