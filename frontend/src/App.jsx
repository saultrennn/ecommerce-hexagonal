import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './modules/auth/LoginPage.jsx';
import RegisterPage from './modules/auth/RegisterPage.jsx';
import CatalogPage from './modules/products/CatalogPage.jsx';
import ProductFormPage from './modules/products/ProductFormPage.jsx';
import CartPage from './modules/orders/CartPage.jsx';
import OrdersPage from './modules/orders/OrdersPage.jsx';
import AnalyticsDashboardPage from './modules/analytics/AnalyticsDashboardPage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<ProtectedRoute adminOnly><CartPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allow={(a) => a.canManageOrders}><OrdersPage /></ProtectedRoute>} />
          <Route path="/products/new" element={<ProtectedRoute allow={(a) => a.canManageProducts}><ProductFormPage /></ProtectedRoute>} />
          <Route path="/products/:id/edit" element={<ProtectedRoute allow={(a) => a.canManageProducts}><ProductFormPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute adminOnly><AnalyticsDashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
