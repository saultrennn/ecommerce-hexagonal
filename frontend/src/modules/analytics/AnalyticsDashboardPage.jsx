import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyticsService } from '../../services/analyticsService.js';
import { formatMoney, STATUS_LABEL } from '../../components/format.js';

const RANGES = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'month', label: 'Este mes' },
  { value: 'custom', label: 'Rango personalizado' },
];

const STATUS_COLOR = {
  pending: '#f59e0b',
  paid: '#2563eb',
  shipped: '#10b981',
  cancelled: '#dc2626',
};

// El backend devuelve las fechas del rango como AAAA-MM-DD
const shortDate = (s) => s.split('-').reverse().join('/');

function periodLabel(period, granularity) {
  const d = new Date(period);
  if (granularity === 'month') {
    return d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
  }
  const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  return granularity === 'week' ? `Sem. ${label}` : label;
}

export default function AnalyticsDashboardPage() {
  const [selected, setSelected] = useState('7d');
  const [query, setQuery] = useState({ range: '7d' });
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    analyticsService.dashboard(query)
      .then((d) => { if (active) { setData(d); setError(''); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  const pickRange = (value) => {
    setSelected(value);
    if (value !== 'custom') setQuery({ range: value });
  };

  const applyCustom = () => {
    if (customFrom && customTo) {
      setQuery({ range: 'custom', from: customFrom, to: customTo });
    }
  };

  const revenueData = (data?.revenueByPeriod || []).map((r) => ({
    label: periodLabel(r.period, data.granularity),
    revenue: r.revenue,
  }));

  const statusData = (data?.orderStatus || []).map((s) => ({
    ...s,
    name: STATUS_LABEL[s.status] || s.status,
    fill: STATUS_COLOR[s.status] || '#9ca3af',
  }));

  return (
    <section>
      <h2>Panel de analítica</h2>

      <div className="card filters">
        <label>
          Período
          <select value={selected} onChange={(e) => pickRange(e.target.value)}>
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        {selected === 'custom' && (
          <>
            <label>
              Desde
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            </label>
            <label>
              Hasta
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </label>
            <button className="btn" onClick={applyCustom} disabled={!customFrom || !customTo}>
              Aplicar
            </button>
          </>
        )}
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {loading && <p className="muted">Cargando...</p>}

      {data && (
        <>
          <p className="muted">
            Del {shortDate(data.range.from)} al {shortDate(data.range.to)}.
            Solo cuentan como ventas los pedidos pagados o enviados.
          </p>

          <div className="kpi-grid">
            <article className="card">
              <p className="muted">Ingresos totales</p>
              <p className="kpi">{formatMoney(data.totalRevenue)}</p>
            </article>
            <article className="card">
              <p className="muted">Ticket promedio por pedido</p>
              <p className="kpi">{formatMoney(data.averageTicket.averagePerOrder)}</p>
            </article>
            <article className="card">
              <p className="muted">Ticket promedio por usuario</p>
              <p className="kpi">{formatMoney(data.averageTicket.averagePerUser)}</p>
            </article>
            <article className="card">
              <p className="muted">Pedidos vendidos</p>
              <p className="kpi">{data.averageTicket.totalOrders}</p>
            </article>
          </div>

          <div className="charts-grid">
            <article className="card">
              <h3>Ingresos en el tiempo</h3>
              {revenueData.length === 0 ? (
                <p className="muted">No hay ventas en este período.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis width={70} tickFormatter={(v) => v.toLocaleString('es-MX')} />
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Bar dataKey="revenue" name="Ingresos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </article>

            <article className="card">
              <h3>Estado de los pedidos</h3>
              {statusData.length === 0 ? (
                <p className="muted">No hay pedidos en este período.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusData} dataKey="count" nameKey="name" innerRadius={45} outerRadius={80} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="status-list">
                    {statusData.map((s) => (
                      <li key={s.status}>
                        <span className={`badge badge-${s.status}`}>{s.name}</span>
                        <span>{s.count} {s.count === 1 ? 'pedido' : 'pedidos'} ({s.percentage}%)</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          </div>

          <article className="card">
            <h3>Productos con mayor rotación</h3>
            {data.topProducts.length === 0 ? (
              <p className="muted">No hay ventas en este período.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th>Unidades</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p, i) => (
                      <tr key={p.productId}>
                        <td>{i + 1}</td>
                        <td>{p.name}</td>
                        <td>{p.unitsSold}</td>
                        <td>{formatMoney(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
}
