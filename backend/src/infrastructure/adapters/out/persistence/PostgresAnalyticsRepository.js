import { AnalyticsRepository } from '../../../../application/ports/out/AnalyticsRepository.js';
import { pool } from './pg.js';

// Un pedido cuenta como venta cuando no está cancelado ni pendiente de pago
const SALE_FILTER = `o.status NOT IN ('cancelled', 'pending')`;
const GRANULARITIES = ['day', 'week', 'month'];

export class PostgresAnalyticsRepository extends AnalyticsRepository {
  async getTopProducts({ from, to, limit = 5 }) {
    const { rows } = await pool.query(
      `SELECT p.id, p.name,
              SUM(oi.quantity)::int AS units_sold,
              SUM(oi.quantity * oi.unit_price) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN products p ON p.id = oi.product_id
        WHERE ${SALE_FILTER} AND o.created_at >= $1 AND o.created_at < $2
        GROUP BY p.id, p.name
        ORDER BY units_sold DESC, revenue DESC
        LIMIT $3`,
      [from, to, limit]
    );
    return rows.map((r) => ({
      productId: r.id,
      name: r.name,
      unitsSold: r.units_sold,
      revenue: Number(r.revenue),
    }));
  }

  async getRevenueByPeriod({ from, to, granularity = 'day' }) {
    if (!GRANULARITIES.includes(granularity)) granularity = 'day';
    const { rows } = await pool.query(
      `SELECT date_trunc('${granularity}', o.created_at) AS period,
              SUM(o.total) AS revenue,
              COUNT(*)::int AS orders
         FROM orders o
        WHERE ${SALE_FILTER} AND o.created_at >= $1 AND o.created_at < $2
        GROUP BY period
        ORDER BY period`,
      [from, to]
    );
    return rows.map((r) => ({
      period: r.period,
      revenue: Number(r.revenue),
      orders: r.orders,
    }));
  }

  async getOrderStatusDistribution({ from, to }) {
    const { rows } = await pool.query(
      `SELECT o.status,
              COUNT(*)::int AS count,
              ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentage
         FROM orders o
        WHERE o.created_at >= $1 AND o.created_at < $2
        GROUP BY o.status
        ORDER BY count DESC`,
      [from, to]
    );
    return rows.map((r) => ({
      status: r.status,
      count: r.count,
      percentage: Number(r.percentage),
    }));
  }

  async getAverageTicket({ from, to }) {
    const { rows } = await pool.query(
      `SELECT COALESCE(AVG(o.total), 0) AS avg_per_order,
              COALESCE(SUM(o.total) / NULLIF(COUNT(DISTINCT o.user_id), 0), 0) AS avg_per_user,
              COUNT(*)::int AS total_orders
         FROM orders o
        WHERE ${SALE_FILTER} AND o.created_at >= $1 AND o.created_at < $2`,
      [from, to]
    );
    const r = rows[0];
    return {
      averagePerOrder: Number(r.avg_per_order),
      averagePerUser: Number(r.avg_per_user),
      totalOrders: r.total_orders,
    };
  }
}
