// Puerto de salida: contrato para notificar eventos de pedidos.
// El dominio y los casos de uso no saben si el canal es correo, SMS u otro.
export class NotificationService {
  // Comprobante de compra e instrucciones de pago para el cliente
  async sendOrderReceipt(order, customer) { throw new Error('No implementado'); }
  // Aviso al administrador de que llegó un pedido nuevo
  async notifyAdminNewOrder(order, customer) { throw new Error('No implementado'); }
}
