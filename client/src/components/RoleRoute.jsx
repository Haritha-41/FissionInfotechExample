import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Requires a specific role. Sends the wrong role to their own dashboard.
export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }
  return children;
}
