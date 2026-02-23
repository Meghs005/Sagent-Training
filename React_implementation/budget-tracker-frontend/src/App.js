import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Accounts from './pages/Accounts'

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/income" element={
        <ProtectedRoute><AppLayout><Income /></AppLayout></ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>
      } />
      <Route path="/budget" element={
        <ProtectedRoute><AppLayout><Budget /></AppLayout></ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute><AppLayout><Goals /></AppLayout></ProtectedRoute>
      } />
      <Route path="/accounts" element={
        <ProtectedRoute><AppLayout><Accounts /></AppLayout></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
