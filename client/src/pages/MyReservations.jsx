import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReservations, cancelReservation } from '../api/reservationApi';
import ReservationCard from '../components/ReservationCard';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getMyReservations()
      .then((res) => setReservations(res.data))
      .catch(() => setError('Failed to load reservations'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onCancel = async (reservation) => {
    try {
      await cancelReservation(reservation._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return <div className="center muted">Loading reservations…</div>;

  return (
    <div>
      <div className="page-head">
        <h1>My reservations</h1>
        <p className="muted">Your bookings, newest dates first.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {reservations.length === 0 ? (
        <div className="empty">
          <p>No reservations yet.</p>
          <Link to="/reservations/new" className="link">Book your first table →</Link>
        </div>
      ) : (
        <div className="list">
          {reservations.map((r) => (
            <ReservationCard key={r._id} reservation={r} onCancel={onCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
