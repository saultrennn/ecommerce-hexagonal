import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card">
      <h2>Iniciar sesión</h2>
      {error && <p className="alert alert-error">{error}</p>}
      <form onSubmit={onSubmit}>
        <label>Correo electrónico
          <input type="email" name="email" value={form.email} onChange={onChange} required />
        </label>
        <label>Contraseña
          <input type="password" name="password" value={form.password} onChange={onChange} required />
        </label>
        <button className="btn" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p className="muted">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}
