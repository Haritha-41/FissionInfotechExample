import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReservations } from '../api/adminApi';

const today = new Date().toISOString().slice(0, 10);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, today: 0 });

  useEffect(() => {
    getAllReservations()
      .then((res) => {
        const all = res.data;
        setStats({
          total: all.length,
          active: all.filter((r) => r.status === 'active').length,
          today: all.filter((r) => r.reservationDate === today && r.status === 'active').length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-head">
        <h1>Admin dashboard</h1>
        <p className="muted">Overview of all restaurant reservations.</p>
      </div>

      <div className="grid">
        <div className="card">
          <span className="muted small">Active today</span>
          <span className="bento-num">{stats.today}</span>
          <span className="muted small">{today}</span>
        </div>
        <div className="card">
          <span className="muted small">Active total</span>
          <span className="bento-num">{stats.active}</span>
        </div>
        <div className="card">
          <span className="muted small">All-time</span>
          <span className="bento-num">{stats.total}</span>
          <span className="muted small">incl. cancelled</span>
        </div>
        <div className="card bento-link" onClick={() => navigate('/admin/reservations')}>
          <span className="muted small">Manage</span>
          <strong style={{ fontSize: '1.1rem' }}>All reservations →</strong>
          <span className="muted small">Filter, edit, cancel.</span>
        </div>
      </div>
    </div>
  );
}
