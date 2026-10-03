// Plantillas de correo: solo construyen el contenido (asunto, texto y HTML).
// No dependen de Nodemailer ni de ningún proveedor de envío.

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n));

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const itemRowsHtml = (order) =>
  order.items.map((i) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #ddd">${esc(i.productName)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center">${i.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right">${money(i.unitPrice)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right">${money(Number(i.unitPrice) * i.quantity)}</td>
    </tr>`).join('');

const itemRowsText = (order) =>
  order.items
    .map((i) => `- ${i.productName} x${i.quantity}  ${money(Number(i.unitPrice) * i.quantity)}`)
    .join('\n');

const tableHtml = (order) => `
  <table style="border-collapse:collapse;width:100%;max-width:560px;font-size:14px">
    <tr style="background:#f3f3f3">
      <th style="padding:6px 8px;text-align:left">Producto</th>
      <th style="padding:6px 8px">Cant.</th>
      <th style="padding:6px 8px;text-align:right">Precio</th>
      <th style="padding:6px 8px;text-align:right">Subtotal</th>
    </tr>
    ${itemRowsHtml(order)}
    <tr>
      <td colspan="3" style="padding:8px;text-align:right"><strong>Total</strong></td>
      <td style="padding:8px;text-align:right"><strong>${money(order.total)}</strong></td>
    </tr>
  </table>`;

// Comprobante e instrucciones de pago para el cliente
export function buildReceiptEmail(order, customer, payment) {
  const text = [
    `Hola ${customer.name},`,
    '',
    `Recibimos tu pedido #${order.id}. Estado: Pendiente de pago.`,
    '',
    itemRowsText(order),
    '',
    `Total a pagar: ${money(order.total)}`,
    '',
    'Datos para la transferencia:',
    `Banco: ${payment.bank}`,
    `Titular: ${payment.accountHolder}`,
    `CLABE: ${payment.clabe}`,
    `Referencia: Pedido ${order.id}`,
    '',
    payment.instructions,
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#222">
      <p>Hola ${esc(customer.name)},</p>
      <p>Recibimos tu pedido <strong>#${order.id}</strong>. Estado: <strong>Pendiente de pago</strong>.</p>
      ${tableHtml(order)}
      <h3 style="margin-bottom:4px">Datos para la transferencia</h3>
      <p style="margin-top:0">
        Banco: ${esc(payment.bank)}<br>
        Titular: ${esc(payment.accountHolder)}<br>
        CLABE: <strong>${esc(payment.clabe)}</strong><br>
        Referencia: Pedido ${order.id}
      </p>
      <p>${esc(payment.instructions)}</p>
    </div>`;

  return { subject: `Pedido #${order.id}: instrucciones de pago`, text, html };
}

// Aviso de pedido nuevo para el administrador
export function buildAdminEmail(order, customer) {
  const text = [
    `Nuevo pedido #${order.id} (Pendiente de pago)`,
    `Cliente: ${customer.name} <${customer.email}>`,
    '',
    itemRowsText(order),
    '',
    `Total: ${money(order.total)}`,
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#222">
      <p>Llegó el pedido <strong>#${order.id}</strong> (Pendiente de pago).</p>
      <p>Cliente: ${esc(customer.name)} &lt;${esc(customer.email)}&gt;</p>
      ${tableHtml(order)}
    </div>`;

  return { subject: `Nuevo pedido #${order.id} de ${customer.name}`, text, html };
}
