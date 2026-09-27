import {
  ValidationError,
  NotFoundError,
  InsufficientStockError,
} from '../errors/DomainError.js';

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

// Transiciones permitidas entre estados
const TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: [],
  cancelled: [],
};

export class OrderItem {
  constructor({ id = null, productId, productName = null, quantity, unitPrice }) {
    this.id = id;
    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
  get subtotal() {
    return (Math.round(this.unitPrice * 100) * this.quantity) / 100;
  }
}

export class Order {
  constructor({ id = null, userId, items, total, status = 'pending', createdAt = null }) {
    if (!ORDER_STATUSES.includes(status)) {
      throw new ValidationError(`Estado inválido. Valores permitidos: ${ORDER_STATUSES.join(', ')}`);
    }
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.total = total;
    this.status = status;
    this.createdAt = createdAt;
  }

  // Regla de negocio: cálculo del monto total (en centavos para evitar errores de coma flotante)
  static calculateTotal(items) {
    const cents = items.reduce((sum, i) => sum + Math.round(i.unitPrice * 100) * i.quantity, 0);
    return cents / 100;
  }

  // Fábrica: valida líneas, comprueba stock y calcula el total.
  // lines: [{ productId, quantity }]   products: Map<id, Product>
  static create({ userId, lines, products }) {
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new ValidationError('El pedido debe contener al menos un producto');
    }

    // Unifica líneas repetidas del mismo producto
    const merged = new Map();
    for (const line of lines) {
      const productId = Number(line.productId);
      const quantity = Number(line.quantity);
      if (!Number.isInteger(productId) || productId <= 0) {
        throw new ValidationError('productId inválido');
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ValidationError('La cantidad debe ser un entero mayor a 0');
      }
      merged.set(productId, (merged.get(productId) || 0) + quantity);
    }

    const items = [];
    for (const [productId, quantity] of merged) {
      const product = products.get(productId);
      if (!product) throw new NotFoundError(`El producto ${productId} no existe`);
      if (!product.hasStock(quantity)) {
        throw new InsufficientStockError(
          `Stock insuficiente para "${product.name}": solicitado ${quantity}, disponible ${product.stock}`
        );
      }
      items.push(new OrderItem({
        productId,
        productName: product.name,
        quantity,
        unitPrice: product.price, // precio congelado al momento de la compra
      }));
    }

    return new Order({ userId, items, total: Order.calculateTotal(items), status: 'pending' });
  }

  changeStatus(next) {
    if (!ORDER_STATUSES.includes(next)) {
      throw new ValidationError(`Estado inválido. Valores permitidos: ${ORDER_STATUSES.join(', ')}`);
    }
    if (!TRANSITIONS[this.status].includes(next)) {
      throw new ValidationError(`No se puede pasar de "${this.status}" a "${next}"`);
    }
    this.status = next;
  }

  cancel() {
    this.changeStatus('cancelled');
  }
}
