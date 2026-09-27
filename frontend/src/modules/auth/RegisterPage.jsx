import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card">
      <h2>Crear cuenta</h2>
      {error && <p className="alert alert-error">{error}</p>}
      <form onSubmit={onSubmit}>
        <label>Nombre
          <input name="name" value={form.name} onChange={onChange} required minLength={2} />
        </label>
        <label>Correo electrónico
          <input type="email" name="email" value={form.email} onChange={onChange} required />
        </label>
        <label>Contraseña
          <input type="password" name="password" value={form.password} onChange={onChange} required />
          <small className="muted">Mínimo 8 caracteres, con mayúscula, minúscula y número.</small>
        </label>
        <button className="btn" disabled={loading}>{loading ? 'Creando...' : 'Registrarme'}</button>
      </form>
      <p className="muted">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}
