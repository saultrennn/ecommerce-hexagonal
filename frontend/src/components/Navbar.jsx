import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const ROLE_LABEL = { admin: 'admin', product_manager: 'gestor de productos', order_manager: 'gestor de pedidos' };

export default function Navbar() {
  const { user, isAdmin, canManageProducts, canManageOrders, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">Tienda</Link>
      <nav>
        <NavLink to="/" end>Catálogo</NavLink>
        {isAdmin && <NavLink to="/cart">Carrito ({count})</NavLink>}
        {canManageOrders && <NavLink to="/orders">Pedidos</NavLink>}
        {canManageProducts && <NavLink to="/products/new">Nuevo producto</NavLink>}
      </nav>
      <div className="session">
        {user ? (
          <>
            <span>{user.name} ({ROLE_LABEL[user.role] || user.role})</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Iniciar sesión</NavLink>
            <NavLink to="/register">Registrarse</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
