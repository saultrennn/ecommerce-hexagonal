import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService.js';

const EMPTY = { name: '', description: '', price: '', stock: '' };

export default function ProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editing) return;
    productService.get(id)
      .then((p) => setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock }))
      .catch((err) => setError(err.message));
  }, [id, editing]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    try {
      if (editing) await productService.update(id, payload);
      else await productService.create(payload);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card">
      <h2>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
      {error && <p className="alert alert-error">{error}</p>}
      <form onSubmit={onSubmit}>
        <label>Nombre
          <input name="name" value={form.name} onChange={onChange} required />
        </label>
        <label>Descripción
          <textarea name="description" rows={3} value={form.description} onChange={onChange} />
        </label>
        <label>Precio (MXN)
          <input type="number" name="price" min="0" step="0.01" value={form.price} onChange={onChange} required />
        </label>
        <label>Inventario
          <input type="number" name="stock" min="0" step="1" value={form.stock} onChange={onChange} required />
        </label>
        <div className="actions">
          <button className="btn" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
