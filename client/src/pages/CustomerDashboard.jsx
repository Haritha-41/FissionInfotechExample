import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyReservations } from '../api/reservationApi';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: 0, total: 0 });

  useEffect(() => {
    getMyReservations()
      .then((res) => {
        const total = res.data.length;
        const active = res.data.filter((r) => r.status === 'active').length;
        setStats({ active, total });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-head">
        <h1>Hi {user.name.split(' ')[0]} 👋</h1>
        <p className="muted">Manage your restaurant reservations.</p>
      </div>

      <div className="grid">
        <div className="card bento-link" onClick={() => navigate('/reservations/new')}>
          <span className="muted small">Quick action</span>
          <strong style={{ fontSize: '1.1rem' }}>Book a table →</strong>
          <span className="muted small">Pick a date, time and party size.</span>
        </div>

        <div className="card bento-link" onClick={() => navigate('/reservations')}>
          <span className="muted small">Upcoming & past</span>
          <strong style={{ fontSize: '1.1rem' }}>My reservations →</strong>
          <span className="muted small">View or cancel your bookings.</span>
        </div>

        <div className="card">
          <span className="muted small">Active reservations</span>
          <span className="bento-num">{stats.active}</span>
          <span className="muted small">{stats.total} total all-time</span>
        </div>
      </div>
    </div>
  );
}
