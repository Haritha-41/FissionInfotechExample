import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
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
      const user = await login(form);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h1>Welcome back</h1>
      <p className="muted" style={{ marginTop: 0 }}>Sign in to manage your reservations.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} required />
      </div>
      <div className="field">
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} required />
      </div>

      <button className="btn-primary" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="muted small" style={{ marginTop: 14, textAlign: 'center' }}>
        No account? <Link to="/register" className="link">Register</Link>
      </p>
    </form>
  );
}
