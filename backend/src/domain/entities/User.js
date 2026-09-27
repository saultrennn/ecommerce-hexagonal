import { ValidationError } from '../errors/DomainError.js';

export const ROLES = ['admin', 'product_manager', 'order_manager'];
export const DEFAULT_ROLE = 'order_manager';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  constructor({ id = null, name, email, passwordHash, role = DEFAULT_ROLE, createdAt = null }) {
    if (!name || String(name).trim().length < 2) {
      throw new ValidationError('El nombre debe tener al menos 2 caracteres');
    }
    if (!EMAIL_RE.test(String(email || '').trim())) {
      throw new ValidationError('El correo electrónico no es válido');
    }
    if (!ROLES.includes(role)) {
      throw new ValidationError(`Rol inválido. Valores permitidos: ${ROLES.join(', ')}`);
    }
    this.id = id;
    this.name = String(name).trim();
    this.email = String(email).trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = createdAt;
  }

  static validatePassword(plain) {
    const p = String(plain ?? '');
    const errors = [];
    if (p.length < 8) errors.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(p)) errors.push('una mayúscula');
    if (!/[a-z]/.test(p)) errors.push('una minúscula');
    if (!/[0-9]/.test(p)) errors.push('un número');
    if (errors.length) {
      throw new ValidationError(`La contraseña debe tener: ${errors.join(', ')}`);
    }
  }

  isAdmin() { return this.role === 'admin'; }
  canManageProducts() { return this.role === 'admin' || this.role === 'product_manager'; }
  canManageOrders() { return this.role === 'admin' || this.role === 'order_manager'; }

  toPublic() {
    return { id: this.id, name: this.name, email: this.email, role: this.role, createdAt: this.createdAt };
  }
}
