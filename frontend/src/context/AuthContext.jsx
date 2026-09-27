import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { tokenStorage } from '../services/apiClient.js';

const AuthContext = createContext(null);
const USER_KEY = 'ecom_user';

function loadUser() {
  try {
    return tokenStorage.get() ? JSON.parse(localStorage.getItem(USER_KEY)) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const logout = useCallback(() => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Si el backend responde 401 con un token guardado, la sesión expiró
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const { token, user: u } = await authService.login(credentials);
    tokenStorage.set(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback((data) => authService.register(data), []);

  const isAdmin = user?.role === 'admin';
  const canManageProducts = isAdmin || user?.role === 'product_manager';
  const canManageOrders = isAdmin || user?.role === 'order_manager';

  const value = useMemo(
    () => ({ user, isAdmin, canManageProducts, canManageOrders, login, register, logout }),
    [user, isAdmin, canManageProducts, canManageOrders, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
