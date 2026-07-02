// Displays one reservation. `showUser` adds the customer (admin views).
// `onCancel` renders a cancel button when provided and status is active.
export default function ReservationCard({ reservation, showUser, onCancel }) {
  const { table, reservationDate, timeSlot, guests, status, user } = reservation;
  const cancelled = status === 'cancelled';

  return (
    <div className="card">
      <div className="card-row">
        <strong>
          Table {table?.tableNumber ?? '—'}
          <span className="muted"> · seats {table?.capacity ?? '—'}</span>
        </strong>
        <span className={`badge ${cancelled ? 'badge-muted' : 'badge-ok'}`}>
          {status}
        </span>
      </div>

      <div className="card-meta">
        <span>📅 {reservationDate}</span>
        <span>🕐 {timeSlot}</span>
        <span>👥 {guests} guests</span>
      </div>

      {showUser && user && (
        <div className="muted small">
          {user.name} · {user.email}
        </div>
      )}

      {onCancel && !cancelled && (
        <button className="btn-danger" onClick={() => onCancel(reservation)}>
          Cancel
        </button>
      )}
    </div>
  );
}
