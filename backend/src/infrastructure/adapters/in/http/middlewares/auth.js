import { tokenService } from '../../../../config/container.js';
import { UnauthorizedError, ForbiddenError } from '../../../../../domain/errors/DomainError.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(new UnauthorizedError('Falta el token Bearer'));
  try {
    const payload = tokenService.verify(token);
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
}

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new ForbiddenError());
