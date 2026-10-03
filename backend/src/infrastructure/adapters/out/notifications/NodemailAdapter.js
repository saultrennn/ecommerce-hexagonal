import nodemailer from 'nodemailer';
import { EmailServicePort } from '../../../../application/ports/out/EmailServicePort.js';
import { buildReceiptEmail, buildAdminEmail } from './emailTemplates.js';

// Adaptador de salida: implementa el puerto con Nodemailer.
// Solo se ocupa de enviar; el contenido viene de emailTemplates.js.
export class NodemailAdapter extends EmailServicePort {
  constructor({ smtp, from, adminEmail, payment }) {
    super();
    this.from = from;
    this.adminEmail = adminEmail;
    this.payment = payment;
    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  }

  async sendOrderReceipt(order, customer) {
    const { subject, text, html } = buildReceiptEmail(order, customer, this.payment);
    await this.transporter.sendMail({ from: this.from, to: customer.email, subject, text, html });
  }

  async notifyAdminNewOrder(order, customer) {
    const { subject, text, html } = buildAdminEmail(order, customer);
    await this.transporter.sendMail({ from: this.from, to: this.adminEmail, subject, text, html });
  }
}
