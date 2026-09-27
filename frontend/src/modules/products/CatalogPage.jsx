import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { formatMoney } from '../../components/format.js';

export default function CatalogPage() {
  const { user, isAdmin, canManageProducts } = useAuth();
  const cart = useCart();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await productService.list());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = (p) => {
    cart.add(p, 1);
    setNotice(`"${p.name}" agregado al carrito`);
    setTimeout(() => setNotice(''), 1800);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.name}"?`)) return;
    try {
      await productService.remove(p.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h2>Catálogo</h2>
      {error && <p className="alert alert-error">{error}</p>}
      {notice && <p className="alert alert-ok">{notice}</p>}
      {loading && <p className="muted">Cargando...</p>}
      <div className="grid">
        {products.map((p) => (
          <article key={p.id} className="card product">
            <h3>{p.name}</h3>
            <p className="muted">{p.description}</p>
            <p className="price">{formatMoney(p.price)}</p>
            <p className={p.stock > 0 ? 'stock' : 'stock out'}>
              {p.stock > 0 ? `Disponibles: ${p.stock}` : 'Agotado'}
            </p>
            <div className="actions">
              {isAdmin && (
                <button className="btn" disabled={p.stock === 0} onClick={() => handleAdd(p)}>
                  Agregar al carrito
                </button>
              )}
              {!isAdmin && !user && (
                <Link className="btn btn-secondary" to="/login">Inicia sesión para comprar</Link>
              )}
              {canManageProducts && (
                <>
                  <Link className="btn btn-secondary" to={`/products/${p.id}/edit`}>Editar</Link>
                  <button className="btn btn-danger" onClick={() => handleDelete(p)}>Eliminar</button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      {!loading && products.length === 0 && !error && <p className="muted">No hay productos.</p>}
    </section>
  );
}
