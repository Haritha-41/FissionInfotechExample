import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReservation } from '../api/reservationApi';

// Must match the backend's TIME_SLOTS.
const TIME_SLOTS = ['12:00', '13:30', '18:00', '19:30', '21:00'];
const today = new Date().toISOString().slice(0, 10);

export default function CreateReservation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    reservationDate: today,
    timeSlot: TIME_SLOTS[0],
    guests: 2,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);
    try {
      const res = await createReservation({ ...form, guests: Number(form.guests) });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h1>Book a table</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        We'll assign the best-fitting available table.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-ok">
          Booked! Table {success.table.tableNumber} on {success.reservationDate} at{' '}
          {success.timeSlot} for {success.guests} guests.{' '}
          <span className="link" onClick={() => navigate('/reservations')}>
            View reservations
          </span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            name="reservationDate"
            min={today}
            value={form.reservationDate}
            onChange={onChange}
            required
          />
        </div>

        <div className="field">
          <label>Time slot</label>
          <select name="timeSlot" value={form.timeSlot} onChange={onChange}>
            {TIME_SLOTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Guests</label>
          <input
            type="number"
            name="guests"
            min={1}
            max={20}
            value={form.guests}
            onChange={onChange}
            required
          />
        </div>

        <button className="btn-primary" disabled={loading}>
          {loading ? 'Checking availability…' : 'Reserve'}
        </button>
      </form>
    </div>
  );
}
