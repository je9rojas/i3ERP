// dashboard.js - Lógica específica del dashboard
console.log("[Dashboard] dashboard.js cargado");

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Dashboard] DOM cargado. Iniciando carga del dashboard...");
    
    // 1. Verificar autenticación reciente
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth') === 'success';
    console.log(`[Dashboard] Parámetro auth=success: ${authSuccess}`);
    
    if (authSuccess) {
        console.log("[Dashboard] Autenticación reciente exitosa");
        window.history.replaceState({}, document.title, "/dashboard");
    }

    try {
        // 2. Referencias a elementos
        const elements = {
            salesValue: document.getElementById('total-sales-value'),
            revenueValue: document.getElementById('revenue-today-value'),
            lowStockValue: document.getElementById('low-stock-value'),
            activeUsersValue: document.getElementById('active-users-value'),
            salesChartCanvas: document.getElementById('salesChart')
        };
        
        // 3. Validar elementos
        const missingElements = Object.entries(elements)
            .filter(([key, el]) => !el)
            .map(([key]) => key);
            
        if (missingElements.length > 0) {
            throw new Error(`Elementos faltantes: ${missingElements.join(', ')}`);
        }

        // 4. Cargar datos
        console.log("[Dashboard] Solicitando datos del dashboard...");
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[Dashboard] Respuesta recibida: ${response.status}`);
        
        // 5. Manejar errores de autenticación
        if (response.status === 401) {
            console.warn("[Dashboard] Token inválido (401) - Redirigiendo a login");
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Dashboard] Error en API: ${response.status} - ${errorText}`);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        // 6. Procesar datos
        const data = await response.json();
        console.log("[Dashboard] Datos recibidos:", data);
        
        // 7. Actualizar UI
        elements.salesValue.textContent = data.sales_today || 0;
        elements.revenueValue.textContent = `$${(data.revenue_today || 0).toLocaleString()}`;
        elements.lowStockValue.textContent = data.low_stock_items || 0;
        elements.activeUsersValue.textContent = data.active_users || 0;

        // 8. Inicializar gráfico
        initializeSalesChart(elements.salesChartCanvas, data);

    } catch (error) {
        console.error('[Dashboard] Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
});



// ... (initializeSalesChart y showNotification permanecen iguales)

function initializeSalesChart(canvas, data) {
    try {
        console.log("[Dashboard] Inicializando gráfico...");
        
        // Destruir gráfico anterior si existe
        if (window.salesChartInstance) {
            console.log("[Dashboard] Destruyendo gráfico anterior");
            window.salesChartInstance.destroy();
        }

        // Crear nuevo gráfico
        const ctx = canvas.getContext('2d');
        window.salesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.sales_labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
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
        
        console.log("[Dashboard] Gráfico inicializado");
        
    } catch (chartError) {
        console.error('[Dashboard] Error en gráfico:', chartError);
        showNotification('Error al cargar gráfico de ventas', 'error');
    }
}

function showNotification(message, type = 'info') {
    try {
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'position-fixed top-0 end-0 p-3';
            notificationContainer.style.zIndex = '9999';
            document.body.appendChild(notificationContainer);
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        notificationContainer.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 150);
            }
        }, 5000);
        
    } catch (e) {
        console.error('Error en notificación:', e);
        alert(`${type.toUpperCase()}: ${message}`);
    }
}