import { UserRepository } from '../../../../application/ports/out/UserRepository.js';
import { User } from '../../../../domain/entities/User.js';
import { pool, translateDbError } from './pg.js';

const toEntity = (r) => r && new User({
  id: r.id, name: r.name, email: r.email,
  passwordHash: r.password_hash, role: r.role, createdAt: r.created_at,
});

export class PostgresUserRepository extends UserRepository {
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return toEntity(rows[0]);
  }
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return toEntity(rows[0]);
  }
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
    return rows.map(toEntity);
  }
  async create(user) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [user.name, user.email, user.passwordHash, user.role]
      );
      return toEntity(rows[0]);
    } catch (err) { throw translateDbError(err); }
  }
  async update(user) {
    try {
      const { rows } = await pool.query(
        `UPDATE users SET name=$1, email=$2, password_hash=$3, role=$4
         WHERE id=$5 RETURNING *`,
        [user.name, user.email, user.passwordHash, user.role, user.id]
      );
      return toEntity(rows[0]);
    } catch (err) { throw translateDbError(err); }
  }
  async delete(id) {
    try {
      const r = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return r.rowCount > 0;
    } catch (err) { throw translateDbError(err); }
  }
}
