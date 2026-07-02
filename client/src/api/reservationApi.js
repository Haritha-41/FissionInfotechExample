import api from './axios';

export const getTables = () => api.get('/tables');
export const createReservation = (data) => api.post('/reservations', data);
export const getMyReservations = () => api.get('/reservations/my');
export const cancelReservation = (id) =>
  api.patch(`/reservations/${id}/cancel`);
