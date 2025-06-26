// Utilidades generales
export function showLoading() {
  document.getElementById('loading').style.display = 'block';
}

export function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(value);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES');
}