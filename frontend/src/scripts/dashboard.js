document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        // Obtener datos del dashboard
        const response = await fetch('/api/dashboard/data', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar datos del dashboard');
        }

        const data = await response.json();
        renderDashboard(data);
    } catch (error) {
        console.error('Error en dashboard:', error);
        alert('Error al cargar el dashboard: ' + error.message);
    }
});

function renderDashboard(data) {
    // Actualizar métricas
    document.querySelector('.metric-card:nth-child(1) .number').textContent = data.sales_today;
    document.querySelector('.metric-card:nth-child(2) .number').textContent = `$${data.revenue_today.toLocaleString()}`;
    document.querySelector('.metric-card:nth-child(3) .number').textContent = data.low_stock_items;
    document.querySelector('.metric-card:nth-child(4) .number').textContent = data.active_users;

    // Actualizar productos populares
    const topProductsList = document.querySelector('.list-group');
    topProductsList.innerHTML = '';
    data.top_products.forEach(product => {
        topProductsList.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">${product.name}</h6>
                    <small class="text-muted">Categoría: ${product.category}</small>
                </div>
                <span class="badge bg-primary">${product.sales} ventas</span>
            </li>
        `;
    });

    // Actualizar últimas ventas
    const salesTable = document.querySelector('.recent-table tbody');
    salesTable.innerHTML = '';
    data.recent_sales.forEach(sale => {
        let statusBadge;
        if (sale.status === 'completed') statusBadge = '<span class="badge bg-success">Completado</span>';
        else if (sale.status === 'pending') statusBadge = '<span class="badge bg-warning">Pendiente</span>';
        else statusBadge = '<span class="badge bg-danger">Cancelado</span>';
        
        salesTable.innerHTML += `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.customer}</td>
                <td>$${sale.amount.toLocaleString()}</td>
                <td>${statusBadge}</td>
                <td>Hoy</td>
            </tr>
        `;
    });

    // Actualizar gráfico de ventas
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    window.salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Ventas 2023',
                data: data.monthly_sales,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
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
}