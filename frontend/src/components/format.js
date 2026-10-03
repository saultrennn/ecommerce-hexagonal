const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
export const formatMoney = (n) => money.format(n);
export const formatDate = (d) =>
  new Date(d).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

export const STATUS_LABEL = {
  pending: 'Pendiente de pago',
  paid: 'Pagado',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
};
