// dashboard.js - Lógica específica del dashboard
console.log("[Dashboard] dashboard.js cargado");

import initializeSalesChart from '../modules/charts.js';

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