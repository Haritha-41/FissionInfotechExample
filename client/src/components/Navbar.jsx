import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        🍽️ Reservations
      </Link>

      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/reservations/new">Book</Link>
            <Link to="/reservations">My Reservations</Link>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/reservations">All Reservations</Link>
          </>
        )}

        {user && (
          <>
            <span className="muted">{user.name}</span>
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
