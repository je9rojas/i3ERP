document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Dashboard] Iniciando carga del dashboard...");
    
    try {
        // 1. Obtener token de autenticación
        const token = localStorage.getItem('auth_token');
        console.log("[Dashboard] Token encontrado:", token ? "Sí" : "No");
        
        // 2. Si no hay token, redirigir al login
        if (!token) {
            console.warn("[Dashboard] No se encontró token - redirigiendo a login");
            window.location.href = '/login';
            return;
        }

        // 3. Referencias a elementos del DOM
        console.log("[Dashboard] Obteniendo elementos del DOM...");
        const salesValue = document.getElementById('total-sales-value');
        const revenueValue = document.getElementById('revenue-today-value');
        const lowStockValue = document.getElementById('low-stock-value');
        const activeUsersValue = document.getElementById('active-users-value');
        const salesChartCanvas = document.getElementById('salesChart');
        
        // 4. Verificar que todos los elementos existen
        const elements = [
            { name: 'total-sales-value', element: salesValue },
            { name: 'revenue-today-value', element: revenueValue },
            { name: 'low-stock-value', element: lowStockValue },
            { name: 'active-users-value', element: activeUsersValue },
            { name: 'salesChart', element: salesChartCanvas }
        ];
        
        const missingElements = elements.filter(item => !item.element).map(item => item.name);
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos faltantes: ${missingElements.join(', ')}`);
        }

        // 5. Cargar datos del dashboard
        console.log("[Dashboard] Solicitando datos a la API...");
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // 6. Manejar errores de autenticación
        if (response.status === 401) {
            console.warn("[Dashboard] Token inválido - eliminando y redirigiendo");
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en la API: ${response.status} - ${errorText}`);
        }

        // 7. Procesar datos recibidos
        const data = await response.json();
        console.log("[Dashboard] Datos recibidos:", data);
        
        // 8. Actualizar métricas
        salesValue.textContent = data.sales_today || 0;
        revenueValue.textContent = `$${(data.revenue_today || 0).toLocaleString()}`;
        lowStockValue.textContent = data.low_stock_items || 0;
        activeUsersValue.textContent = data.active_users || 0;

        // 9. Inicializar gráfico
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
        // Crear contenedor si no existe
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'position-fixed top-0 end-0 p-3';
            notificationContainer.style.zIndex = '9999';
            document.body.appendChild(notificationContainer);
        }

        // Crear alerta
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
            if (alert.parentNode) {
                alert.classList.remove('show');
                setTimeout(() => {
                    if (alert.parentNode) alert.remove();
                }, 150);
            }
        }, 5000);
        
    } catch (e) {
        console.error('Error al mostrar notificación:', e);
        // Fallback a alerta básica
        alert(`${type.toUpperCase()}: ${message}`);
    }
}