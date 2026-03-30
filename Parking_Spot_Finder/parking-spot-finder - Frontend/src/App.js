import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import SearchParking  from './pages/SearchParking';
import BookingPage    from './pages/BookingPage';
import BookingHistory from './pages/BookingHistory';
import MyVehicles     from './pages/MyVehicles';
import Wallet         from './pages/Wallet';
import NotFound       from './pages/NotFound';

import MySpots        from './pages/spotlender/MySpots';
import AddSpot        from './pages/spotlender/AddSpot';
import LenderEarnings from './pages/spotlender/LenderEarnings';
import LenderSlots    from './pages/spotlender/LenderSlots';

import AdminSpots     from './pages/admin/AdminSpots';
import AdminLocations from './pages/admin/AdminLocations';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminRevenue   from './pages/admin/AdminRevenue';
import AdminPricing   from './pages/admin/AdminPricing';
import AdminBookings  from './pages/admin/AdminBookings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search"   element={<SearchParking />} />
          <Route path="/"         element={<Navigate to="/login" replace />} />

          {/* Authenticated — all logged-in roles */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* User only */}
          <Route path="/book/:spotId" element={
            <ProtectedRoute roles={['USER']}><BookingPage /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute roles={['USER']}><BookingHistory /></ProtectedRoute>
          } />
          <Route path="/vehicles" element={
            <ProtectedRoute roles={['USER']}><MyVehicles /></ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute roles={['USER']}><Wallet /></ProtectedRoute>
          } />

          {/* Spot Lender only */}
          <Route path="/lender/my-spots" element={
            <ProtectedRoute roles={['SPOT_LENDER']}><MySpots /></ProtectedRoute>
          } />
          <Route path="/lender/my-slots" element={
            <ProtectedRoute roles={['SPOT_LENDER']}><LenderSlots /></ProtectedRoute>
          } />

          <Route path="/lender/earnings" element={
            <ProtectedRoute roles={['SPOT_LENDER']}><LenderEarnings /></ProtectedRoute>
          } />

          <Route path="/lender/add-spot" element={
            <ProtectedRoute roles={['SPOT_LENDER']}><AddSpot /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin/spots" element={
            <ProtectedRoute roles={['ADMIN']}><AdminSpots /></ProtectedRoute>
          } />
          <Route path="/admin/locations" element={
            <ProtectedRoute roles={['ADMIN']}><AdminLocations /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute roles={['ADMIN']}><AdminBookings /></ProtectedRoute>
          } />

          <Route path="/admin/pricing" element={
            <ProtectedRoute roles={['ADMIN']}><AdminPricing /></ProtectedRoute>
          } />

          <Route path="/admin/revenue" element={
            <ProtectedRoute roles={['ADMIN']}><AdminRevenue /></ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
