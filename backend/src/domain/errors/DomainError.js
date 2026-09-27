// Errores del dominio: NO conocen HTTP. El adaptador de entrada los traduce a códigos de estado.
export class DomainError extends Error {
  constructor(message, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}
export class ValidationError extends DomainError {
  constructor(message) { super(message, 'VALIDATION'); }
}
export class UnauthorizedError extends DomainError {
  constructor(message = 'No autenticado') { super(message, 'UNAUTHORIZED'); }
}
export class ForbiddenError extends DomainError {
  constructor(message = 'No tienes permisos para esta acción') { super(message, 'FORBIDDEN'); }
}
export class NotFoundError extends DomainError {
  constructor(message = 'Recurso no encontrado') { super(message, 'NOT_FOUND'); }
}
export class ConflictError extends DomainError {
  constructor(message) { super(message, 'CONFLICT'); }
}
export class InsufficientStockError extends DomainError {
  constructor(message) { super(message, 'INSUFFICIENT_STOCK'); }
}
