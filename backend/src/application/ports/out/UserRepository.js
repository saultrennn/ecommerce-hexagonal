// Puerto de salida: contrato que debe cumplir cualquier repositorio de usuarios.
export class UserRepository {
  async findById(id) { throw new Error('No implementado'); }
  async findByEmail(email) { throw new Error('No implementado'); }
  async findAll() { throw new Error('No implementado'); }
  async create(user) { throw new Error('No implementado'); }
  async update(user) { throw new Error('No implementado'); }
  async delete(id) { throw new Error('No implementado'); }
}
