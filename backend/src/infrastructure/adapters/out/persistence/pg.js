import pg from 'pg';
import { config } from '../../../config/env.js';
import { ConflictError } from '../../../../domain/errors/DomainError.js';

// NUMERIC llega como string por defecto: lo convertimos a número
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));

export const pool = new pg.Pool(config.db);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Traduce errores de PostgreSQL a errores del dominio
export function translateDbError(err) {
  if (err.code === '23505') return new ConflictError('Ya existe un registro con ese valor único');
  if (err.code === '23503') {
    return new ConflictError('No se puede eliminar: hay registros relacionados (pedidos)');
  }
  return err;
}
