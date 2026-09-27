import { ValidationError } from '../errors/DomainError.js';

export class Product {
  constructor({ id = null, name, description = '', price, stock = 0, createdAt = null }) {
    if (!name || String(name).trim().length < 2) {
      throw new ValidationError('El nombre del producto debe tener al menos 2 caracteres');
    }
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      throw new ValidationError('El precio debe ser un número mayor o igual a 0');
    }
    const s = Number(stock);
    if (!Number.isInteger(s) || s < 0) {
      throw new ValidationError('El stock debe ser un entero mayor o igual a 0');
    }
    this.id = id;
    this.name = String(name).trim();
    this.description = description ? String(description) : '';
    this.price = Math.round(p * 100) / 100;
    this.stock = s;
    this.createdAt = createdAt;
  }

  // Regla de negocio: comprobación de stock disponible
  hasStock(quantity) {
    return this.stock >= quantity;
  }
}
