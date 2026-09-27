import jwt from 'jsonwebtoken';
import { TokenService } from '../../../../application/ports/out/TokenService.js';
import { config } from '../../../config/env.js';
import { UnauthorizedError } from '../../../../domain/errors/DomainError.js';

export class JwtTokenService extends TokenService {
  sign(payload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  }
  verify(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }
}
