import api from './axios';

// date is optional "YYYY-MM-DD"
export const getAllReservations = (date) =>
  api.get('/admin/reservations', { params: date ? { date } : {} });
export const updateReservation = (id, data) =>
  api.patch(`/admin/reservations/${id}`, data);
export const adminCancelReservation = (id) =>
  api.patch(`/admin/reservations/${id}/cancel`);
