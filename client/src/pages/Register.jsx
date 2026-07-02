import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
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
      await register(form); // registration always creates a customer
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h1>Create account</h1>
      <p className="muted" style={{ marginTop: 0 }}>Book a table in seconds.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <label>Name</label>
        <input name="name" value={form.name} onChange={onChange} required />
      </div>
      <div className="field">
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} required />
      </div>
      <div className="field">
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} minLength={6} required />
      </div>

      <button className="btn-primary" disabled={loading}>
        {loading ? 'Creating…' : 'Create account'}
      </button>

      <p className="muted small" style={{ marginTop: 14, textAlign: 'center' }}>
        Already registered? <Link to="/login" className="link">Sign in</Link>
      </p>
    </form>
  );
}
