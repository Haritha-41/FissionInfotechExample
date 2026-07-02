import { useEffect, useState } from 'react';
import {
  getAllReservations,
  adminCancelReservation,
  updateReservation,
} from '../api/adminApi';

const TIME_SLOTS = ['12:00', '13:30', '18:00', '19:30', '21:00'];

export default function AdminReservations() {
  const [date, setDate] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const load = (filterDate) => {
    setLoading(true);
    setError('');
    getAllReservations(filterDate || undefined)
      .then((res) => setReservations(res.data))
      .catch(() => setError('Failed to load reservations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(''), []);

  const onCancel = async (r) => {
    try {
      await adminCancelReservation(r._id);
      load(date);
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed');
    }
  };

  const onSave = async (id, changes) => {
    try {
      await updateReservation(id, changes);
      setEditingId(null);
      load(date);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>All reservations</h1>
        <p className="muted">Filter by date, edit, or cancel any booking.</p>
      </div>

      <div className="toolbar">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Filter by date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button className="btn-ghost" onClick={() => load(date)}>Apply</button>
        {date && (
          <button className="btn-ghost" onClick={() => { setDate(''); load(''); }}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="center muted">Loading…</div>
      ) : reservations.length === 0 ? (
        <div className="empty">No reservations{date ? ` on ${date}` : ''}.</div>
      ) : (
        <div className="list">
          {reservations.map((r) => (
            <AdminRow
              key={r._id}
              reservation={r}
              editing={editingId === r._id}
              onEdit={() => setEditingId(r._id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminRow({ reservation, editing, onEdit, onCancelEdit, onSave, onCancel }) {
  const r = reservation;
  const cancelled = r.status === 'cancelled';
  const [form, setForm] = useState({
    reservationDate: r.reservationDate,
    timeSlot: r.timeSlot,
    guests: r.guests,
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="card">
      <div className="card-row">
        <strong>
          Table {r.table?.tableNumber ?? '—'}
          <span className="muted"> · seats {r.table?.capacity ?? '—'}</span>
        </strong>
        <span className={`badge ${cancelled ? 'badge-muted' : 'badge-ok'}`}>{r.status}</span>
      </div>

      <div className="muted small">{r.user?.name} · {r.user?.email}</div>

      {editing ? (
        <div className="stack">
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input type="date" name="reservationDate" value={form.reservationDate} onChange={onChange} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Slot</label>
              <select name="timeSlot" value={form.timeSlot} onChange={onChange}>
                {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Guests</label>
              <input type="number" name="guests" min={1} max={20} value={form.guests} onChange={onChange} />
            </div>
          </div>
          <div className="row-actions">
            <button
              className="btn-ghost"
              onClick={() => onSave(r._id, { ...form, guests: Number(form.guests) })}
            >
              Save
            </button>
            <button className="btn-ghost" onClick={onCancelEdit}>Discard</button>
          </div>
        </div>
      ) : (
        <>
          <div className="card-meta">
            <span>📅 {r.reservationDate}</span>
            <span>🕐 {r.timeSlot}</span>
            <span>👥 {r.guests} guests</span>
          </div>
          {!cancelled && (
            <div className="row-actions">
              <button className="btn-ghost" onClick={onEdit}>Edit</button>
              <button className="btn-danger" onClick={() => onCancel(r)}>Cancel</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
