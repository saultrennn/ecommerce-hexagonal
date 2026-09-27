import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { orderService } from '../../services/orderService.js';
import { formatMoney } from '../../components/format.js';

export default function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    setError('');
    setLoading(true);
    try {
      await orderService.create(
        cart.items.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
      );
      cart.clear();
      navigate('/orders');
    } catch (err) {
      setError(err.message); // p. ej. "Stock insuficiente para ..."
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <section>
        <h2>Carrito</h2>
        <p className="muted">Tu carrito está vacío. <Link to="/">Ir al catálogo</Link></p>
      </section>
    );
  }

  return (
    <section>
      <h2>Carrito</h2>
      {error && <p className="alert alert-error">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
          </thead>
          <tbody>
            {cart.items.map(({ product, quantity }) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{formatMoney(product.price)}</td>
                <td>
                  <input
                    className="qty" type="number" min="1" max={product.stock} value={quantity}
                    onChange={(e) => cart.setQuantity(product.id, Number(e.target.value) || 1)}
                  />
                </td>
                <td>{formatMoney(product.price * quantity)}</td>
                <td><button className="btn btn-danger" onClick={() => cart.remove(product.id)}>Quitar</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}><strong>Total estimado</strong></td><td colSpan={2}><strong>{formatMoney(cart.total)}</strong></td></tr>
          </tfoot>
        </table>
      </div>
      <p className="muted">El servidor valida el stock y calcula el total definitivo al crear el pedido.</p>
      <div className="actions">
        <button className="btn" onClick={placeOrder} disabled={loading}>
          {loading ? 'Procesando...' : 'Realizar pedido'}
        </button>
        <button className="btn btn-secondary" onClick={cart.clear}>Vaciar carrito</button>
      </div>
    </section>
  );
}
