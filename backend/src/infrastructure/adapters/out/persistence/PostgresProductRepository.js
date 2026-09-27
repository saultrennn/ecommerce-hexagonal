import { ProductRepository } from '../../../../application/ports/out/ProductRepository.js';
import { Product } from '../../../../domain/entities/Product.js';
import { pool, translateDbError } from './pg.js';

const toEntity = (r) => r && new Product({
  id: r.id, name: r.name, description: r.description,
  price: r.price, stock: r.stock, createdAt: r.created_at,
});

export class PostgresProductRepository extends ProductRepository {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
    return rows.map(toEntity);
  }
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return toEntity(rows[0]);
  }
  async findByIds(ids) {
    if (!ids.length) return [];
    const { rows } = await pool.query('SELECT * FROM products WHERE id = ANY($1::int[])', [ids]);
    return rows.map(toEntity);
  }
  async create(product) {
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, stock)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product.name, product.description, product.price, product.stock]
    );
    return toEntity(rows[0]);
  }
  async update(product) {
    const { rows } = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4
       WHERE id=$5 RETURNING *`,
      [product.name, product.description, product.price, product.stock, product.id]
    );
    return toEntity(rows[0]);
  }
  async delete(id) {
    try {
      const r = await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return r.rowCount > 0;
    } catch (err) { throw translateDbError(err); }
  }
}
