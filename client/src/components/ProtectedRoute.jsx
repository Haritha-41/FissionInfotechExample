import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Requires a logged-in user; otherwise redirects to login.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center muted">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}
