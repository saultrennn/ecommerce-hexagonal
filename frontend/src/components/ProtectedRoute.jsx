import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// allow: función opcional (auth) => boolean para permisos más finos que "admin"
export default function ProtectedRoute({ children, adminOnly = false, allow }) {
  const auth = useAuth();
  if (!auth.user) return <Navigate to="/login" replace />;
  if (adminOnly && !auth.isAdmin) return <Navigate to="/" replace />;
  if (allow && !allow(auth)) return <Navigate to="/" replace />;
  return children;
}
