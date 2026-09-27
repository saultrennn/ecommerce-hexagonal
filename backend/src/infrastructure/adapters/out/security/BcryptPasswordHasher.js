import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../../../application/ports/out/PasswordHasher.js';
import { config } from '../../../config/env.js';

export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain) { return bcrypt.hash(plain, config.bcryptRounds); }
  compare(plain, hash) { return bcrypt.compare(plain, hash); }
}
