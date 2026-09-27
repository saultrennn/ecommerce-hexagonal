// Puerto de salida: contrato del repositorio de pedidos.
// create() y cancel() deben ser atómicos (pedido + stock en una sola transacción).
export class OrderRepository {
  async create(order) { throw new Error('No implementado'); }
  async findById(id) { throw new Error('No implementado'); }
  async findAll() { throw new Error('No implementado'); }
  async findByUserId(userId) { throw new Error('No implementado'); }
  async updateStatus(id, status) { throw new Error('No implementado'); }
  async cancel(order) { throw new Error('No implementado'); }
}
