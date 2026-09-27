import { User, DEFAULT_ROLE } from '../../domain/entities/User.js';
import {
  ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError,
} from '../../domain/errors/DomainError.js';

// requester = { id, role } (viene del token verificado)
function assertSelfOrAdmin(requester, targetId) {
  if (requester.role !== 'admin' && Number(requester.id) !== Number(targetId)) {
    throw new ForbiddenError();
  }
}

export class RegisterUser {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }
  async execute({ name, email, password }) {
    User.validatePassword(password);
    const draft = new User({ name, email, passwordHash: 'pendiente' }); // valida nombre y correo
    if (await this.userRepository.findByEmail(draft.email)) {
      throw new ConflictError('Ya existe un usuario con ese correo');
    }
    const passwordHash = await this.passwordHasher.hash(password);
    // El registro público SIEMPRE crea clientes; el rol admin se asigna aparte
    // El registro público asigna el rol base (order_manager); el admin reasigna roles después
    const saved = await this.userRepository.create(
      new User({ name: draft.name, email: draft.email, passwordHash, role: DEFAULT_ROLE })
    );
    return saved.toPublic();
  }
}

export class Login {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }
  async execute({ email, password }) {
    if (!email || !password) throw new ValidationError('Correo y contraseña son obligatorios');
    const user = await this.userRepository.findByEmail(String(email).trim().toLowerCase());
    const ok = user && (await this.passwordHasher.compare(String(password), user.passwordHash));
    if (!ok) throw new UnauthorizedError('Credenciales inválidas'); // mismo mensaje en ambos casos
    const token = this.tokenService.sign({ sub: user.id, role: user.role });
    return { token, user: user.toPublic() };
  }
}

export class ListUsers {
  constructor({ userRepository }) { this.userRepository = userRepository; }
  async execute() {
    return (await this.userRepository.findAll()).map((u) => u.toPublic());
  }
}

export class GetUser {
  constructor({ userRepository }) { this.userRepository = userRepository; }
  async execute({ id, requester }) {
    assertSelfOrAdmin(requester, id);
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return user.toPublic();
  }
}

export class UpdateUser {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }
  async execute({ id, requester, data }) {
    assertSelfOrAdmin(requester, id);
    const current = await this.userRepository.findById(id);
    if (!current) throw new NotFoundError('Usuario no encontrado');

    if (data.role !== undefined && data.role !== current.role && requester.role !== 'admin') {
      throw new ForbiddenError('Solo un administrador puede cambiar roles');
    }

    let passwordHash = current.passwordHash;
    if (data.password !== undefined) {
      User.validatePassword(data.password);
      passwordHash = await this.passwordHasher.hash(data.password);
    }

    const updated = new User({
      id: current.id,
      name: data.name ?? current.name,
      email: data.email ?? current.email,
      role: data.role ?? current.role,
      passwordHash,
      createdAt: current.createdAt,
    });

    if (updated.email !== current.email) {
      const other = await this.userRepository.findByEmail(updated.email);
      if (other && other.id !== current.id) throw new ConflictError('Ya existe un usuario con ese correo');
    }
    return (await this.userRepository.update(updated)).toPublic();
  }
}

export class DeleteUser {
  constructor({ userRepository }) { this.userRepository = userRepository; }
  async execute({ id }) {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) throw new NotFoundError('Usuario no encontrado');
  }
}
