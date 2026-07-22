import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HotelDetailPage from './pages/HotelDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProfilePage from './pages/ProfilePage';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import ManagerHotelsPage from './pages/manager/ManagerHotelsPage';
import ManagerHotelEditPage from './pages/manager/ManagerHotelEditPage';
import ManagerRoomsPage from './pages/manager/ManagerRoomsPage';
import ManagerBookingsPage from './pages/manager/ManagerBookingsPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminHotelsPage from './pages/admin/AdminHotelsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Customer */}
        <Route
          path="/checkout/:roomId"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customer"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Hotel Manager */}
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute roles={['HOTEL_MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/hotels"
          element={
            <ProtectedRoute roles={['HOTEL_MANAGER']}>
              <ManagerHotelsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/hotels/new"
          element={
            <ProtectedRoute roles={['HOTEL_MANAGER']}>
              <ManagerHotelEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/hotels/:id/edit"
          element={
            <ProtectedRoute roles={['HOTEL_MANAGER']}>
              <ManagerHotelEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/hotels/:id/rooms"
          element={
            <ProtectedRoute roles={['HOTEL_MANAGER']}>
              <ManagerRoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/bookings"
          element={
            <ProtectedRoute roles={['HOTEL_MANAGER']}>
              <ManagerBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hotels"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminHotelsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
