// Puerto de salida: consultas analíticas de solo lectura.
// Devuelve datos agregados (objetos planos), no entidades del dominio.
// Todos los métodos reciben un rango { from, to } de fechas (objetos Date).
export class AnalyticsRepository {
  // Top de productos por unidades vendidas y monto recaudado
  async getTopProducts({ from, to, limit }) { throw new Error('No implementado'); }
  // Ingresos agrupados por período: granularity = 'day' | 'week' | 'month'
  async getRevenueByPeriod({ from, to, granularity }) { throw new Error('No implementado'); }
  // Conteo y porcentaje de pedidos por estado
  async getOrderStatusDistribution({ from, to }) { throw new Error('No implementado'); }
  // Ticket promedio por pedido y por usuario
  async getAverageTicket({ from, to }) { throw new Error('No implementado'); }
}
