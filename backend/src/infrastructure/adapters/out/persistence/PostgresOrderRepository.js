import { OrderRepository } from '../../../../application/ports/out/OrderRepository.js';
import { Order, OrderItem } from '../../../../domain/entities/Order.js';
import { ConflictError, InsufficientStockError } from '../../../../domain/errors/DomainError.js';
import { pool, withTransaction } from './pg.js';

// Une filas de pedidos con sus ítems y devuelve entidades del dominio
async function hydrate(orderRows) {
  if (!orderRows.length) return [];
  const ids = orderRows.map((o) => o.id);
  const { rows: itemRows } = await pool.query(
    `SELECT oi.*, p.name AS product_name
       FROM order_items oi JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ANY($1::int[]) ORDER BY oi.id`,
    [ids]
  );
  return orderRows.map((o) => new Order({
    id: o.id, userId: o.user_id, total: o.total, status: o.status, createdAt: o.created_at,
    items: itemRows.filter((i) => i.order_id === o.id).map((i) => new OrderItem({
      id: i.id, productId: i.product_id, productName: i.product_name,
      quantity: i.quantity, unitPrice: i.unit_price,
    })),
  }));
}

export class PostgresOrderRepository extends OrderRepository {
  // Transacción: descuenta stock (con guarda de concurrencia) + inserta pedido e ítems
  async create(order) {
    return withTransaction(async (client) => {
      for (const item of order.items) {
        const r = await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
          [item.quantity, item.productId]
        );
        if (r.rowCount === 0) {
          throw new InsufficientStockError(`Stock insuficiente para "${item.productName}"`);
        }
      }
      const { rows } = await client.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id, created_at',
        [order.userId, order.total, order.status]
      );
      const orderId = rows[0].id;
      for (const item of order.items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.productId, item.quantity, item.unitPrice]
        );
      }
      return new Order({ ...order, id: orderId, createdAt: rows[0].created_at });
    });
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return (await hydrate(rows))[0] || null;
  }
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    return hydrate(rows);
  }
  async findByUserId(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC', [userId]
    );
    return hydrate(rows);
  }
  async updateStatus(id, status) {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
  }

  // Cancelación atómica: cambia estado y devuelve el stock
  async cancel(order) {
    return withTransaction(async (client) => {
      const r = await client.query(
        `UPDATE orders SET status = 'cancelled'
          WHERE id = $1 AND status IN ('pending','paid') RETURNING id`,
        [order.id]
      );
      if (r.rowCount === 0) throw new ConflictError('El pedido ya no se puede cancelar');
      for (const item of order.items) {
        await client.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }
    });
  }
}
