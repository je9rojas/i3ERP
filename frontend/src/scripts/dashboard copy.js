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

        if (response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('access_token');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            throw new Error(`Error ${response.status} al cargar datos`);
        }

        const data = await response.json();
        renderDashboard(data);
        
        // Actualizar UI con datos de usuario
        const userName = localStorage.getItem('user_name') || 'Administrador';
        const userElements = document.querySelectorAll('.user-info');
        if (userElements.length > 0) {
            userElements.forEach(el => {
                el.textContent = userName;
            });
        } else {
            console.warn('No se encontraron elementos .user-info');
        }
        
    } catch (error) {
        console.error('Error en dashboard:', error);
        alert('Error al cargar el dashboard: ' + error.message);
        window.location.href = '/login';
    }
});

function renderDashboard(data) {
    // 1. Actualizar métricas con verificación de elementos
    const metricSelectors = [
        '#metric-sales .number',
        '#metric-revenue .number',
        '#metric-low-stock .number',
        '#metric-active-users .number'
    ];
    
    const metricValues = [
        data.sales_today,
        `$${data.revenue_today.toLocaleString()}`,
        data.low_stock_items,
        data.active_users
    ];
    
    metricSelectors.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = metricValues[index];
        } else {
            console.error(`Elemento no encontrado: ${selector}`);
        }
    });

    // 2. Actualizar productos populares
    const topProductsList = document.querySelector('#top-products-list');
    if (topProductsList) {
        topProductsList.innerHTML = '';
        data.top_products.forEach(product => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <div>
                    <h6 class="mb-0">${product.name}</h6>
                    <small class="text-muted">Categoría: ${product.category}</small>
                </div>
                <span class="badge bg-primary">${product.sales} ventas</span>
            `;
            topProductsList.appendChild(li);
        });
    } else {
        console.error('Contenedor de productos populares no encontrado');
    }

    // 3. Actualizar últimas ventas
    const salesTable = document.querySelector('#recent-sales-body');
    if (salesTable) {
        salesTable.innerHTML = '';
        data.recent_sales.forEach(sale => {
            let statusBadge;
            if (sale.status === 'completed') statusBadge = '<span class="badge bg-success">Completado</span>';
            else if (sale.status === 'pending') statusBadge = '<span class="badge bg-warning">Pendiente</span>';
            else statusBadge = '<span class="badge bg-danger">Cancelado</span>';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sale.id}</td>
                <td>${sale.customer}</td>
                <td>$${sale.amount.toLocaleString()}</td>
                <td>${statusBadge}</td>
                <td>Hoy</td>
            `;
            salesTable.appendChild(tr);
        });
    } else {
        console.error('Tabla de ventas no encontrada');
    }

    // 4. Actualizar gráfico de ventas
    const salesCanvas = document.getElementById('salesChart');
    if (salesCanvas) {
        // Verificar y destruir gráfico anterior de forma segura
        if (window.salesChart && window.salesChart instanceof Chart) {
            window.salesChart.destroy();
        }
        
        const salesCtx = salesCanvas.getContext('2d');
        
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
    } else {
        console.error('Canvas para gráfico de ventas no encontrado');
    }
    
    // 5. Agregar funcionalidad de logout
    const logoutBtn = document.querySelector('a[href="/logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '/login';
        });
    } else {
        console.warn('Botón de logout no encontrado');
    }
}