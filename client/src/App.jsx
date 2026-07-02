import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateReservation from './pages/CreateReservation';
import MyReservations from './pages/MyReservations';
import AdminDashboard from './pages/AdminDashboard';
import AdminReservations from './pages/AdminReservations';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer */}
          <Route
            path="/"
            element={
              <RoleRoute role="customer">
                <CustomerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/reservations/new"
            element={
              <RoleRoute role="customer">
                <CreateReservation />
              </RoleRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <RoleRoute role="admin">
                <AdminReservations />
              </RoleRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
