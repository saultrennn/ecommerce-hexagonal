import { ValidationError } from '../../domain/errors/DomainError.js';

const GRANULARITIES = ['day', 'week', 'month'];
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const toDateString = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const round2 = (n) => Math.round(n * 100) / 100;

function parseDate(value, label) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!m) throw new ValidationError(`"${label}" debe tener formato AAAA-MM-DD`);
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (date.getMonth() !== Number(m[2]) - 1) throw new ValidationError(`"${label}" no es una fecha válida`);
  return date;
}

// Devuelve { from, to } con "to" exclusivo (medianoche del día siguiente)
export function resolveRange({ range = '7d', from, to }, now = new Date()) {
  const today = startOfDay(now);
  switch (range) {
    case 'today': return { from: today, to: addDays(today, 1) };
    case '7d': return { from: addDays(today, -6), to: addDays(today, 1) };
    case '30d': return { from: addDays(today, -29), to: addDays(today, 1) };
    case 'month': return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: addDays(today, 1) };
    case 'custom': {
      const f = parseDate(from, 'from');
      const t = parseDate(to, 'to');
      if (t < f) throw new ValidationError('La fecha final no puede ser anterior a la inicial');
      return { from: f, to: addDays(t, 1) };
    }
    default:
      throw new ValidationError('Rango inválido: usa today, 7d, 30d, month o custom');
  }
}

function pickGranularity(requested, { from, to }) {
  if (requested) {
    if (!GRANULARITIES.includes(requested)) {
      throw new ValidationError('Granularidad inválida: usa day, week o month');
    }
    return requested;
  }
  const days = Math.round((to - from) / 86400000);
  if (days <= 31) return 'day';
  if (days <= 180) return 'week';
  return 'month';
}

export class AnalyticsService {
  constructor({ analyticsRepository }) {
    this.analyticsRepository = analyticsRepository;
  }

  async getDashboard({ range, from, to, granularity, limit }) {
    const period = resolveRange({ range, from, to });
    const gran = pickGranularity(granularity, period);
    const top = Math.min(Math.max(Number(limit) || 5, 1), 10);

    const [topProducts, revenueByPeriod, orderStatus, averageTicket] = await Promise.all([
      this.analyticsRepository.getTopProducts({ ...period, limit: top }),
      this.analyticsRepository.getRevenueByPeriod({ ...period, granularity: gran }),
      this.analyticsRepository.getOrderStatusDistribution(period),
      this.analyticsRepository.getAverageTicket(period),
    ]);

    return {
      range: { from: toDateString(period.from), to: toDateString(addDays(period.to, -1)) },
      granularity: gran,
      totalRevenue: round2(revenueByPeriod.reduce((sum, r) => sum + r.revenue, 0)),
      averageTicket,
      revenueByPeriod,
      orderStatus,
      topProducts,
    };
  }
}
