// charts.js - Funciones para manejar gráficos
export default function initializeSalesChart(canvas, data) {
    try {
        console.log("[Charts] Inicializando gráfico de ventas...");
        
        // Destruir gráfico anterior si existe
        if (window.salesChartInstance) {
            console.log("[Charts] Destruyendo gráfico anterior");
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
        
        console.log("[Charts] Gráfico de ventas inicializado");
        
    } catch (chartError) {
        console.error('[Charts] Error en gráfico:', chartError);
        showNotification('Error al cargar gráfico de ventas', 'error');
    }
}