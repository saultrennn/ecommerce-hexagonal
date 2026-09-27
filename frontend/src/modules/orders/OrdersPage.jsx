import { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, formatMoney, STATUS_LABEL } from '../../components/format.js';

const NEXT_STATUS = { pending: ['paid'], paid: ['shipped'], shipped: [], cancelled: [] };

export default function OrdersPage() {
  const { canManageOrders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await orderService.list());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const run = async (action) => {
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = (o) => {
    if (window.confirm(`¿Cancelar el pedido #${o.id}? Se devolverá el stock.`)) {
      run(() => orderService.cancel(o.id));
    }
  };

  return (
    <section>
      <h2>{canManageOrders ? 'Todos los pedidos' : 'Mis pedidos'}</h2>
      {error && <p className="alert alert-error">{error}</p>}
      {loading && <p className="muted">Cargando...</p>}
      {!loading && orders.length === 0 && <p className="muted">Aún no hay pedidos.</p>}
      {orders.map((o) => (
        <article key={o.id} className="card order">
          <header>
            <h3>Pedido #{o.id}</h3>
            <span className={`badge badge-${o.status}`}>{STATUS_LABEL[o.status]}</span>
          </header>
          <p className="muted">
            {formatDate(o.createdAt)}{canManageOrders && ` · Usuario #${o.userId}`}
          </p>
          <ul>
            {o.items.map((i) => (
              <li key={i.id}>
                {i.quantity} × {i.productName} — {formatMoney(i.unitPrice)} c/u
              </li>
            ))}
          </ul>
          <p className="price">Total: {formatMoney(o.total)}</p>
          <div className="actions">
            {canManageOrders && NEXT_STATUS[o.status].map((s) => (
              <button key={s} className="btn" onClick={() => run(() => orderService.updateStatus(o.id, s))}>
                Marcar como {STATUS_LABEL[s].toLowerCase()}
              </button>
            ))}
            {(o.status === 'pending' || o.status === 'paid') && (
              <button className="btn btn-danger" onClick={() => cancel(o)}>Cancelar pedido</button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
