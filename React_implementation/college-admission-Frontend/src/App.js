import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import MyApplications from './pages/MyApplications';
import ApplicationDetail from './pages/ApplicationDetail';
import OfficerReview from './pages/OfficerReview';
import CoursesManage from './pages/CoursesManage';
import './index.css';

const PrivateRoute = ({ children, role }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (role && currentUser.role !== role) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute role="STUDENT"><Dashboard /></PrivateRoute>} />
      <Route path="/apply" element={<PrivateRoute role="STUDENT"><Apply /></PrivateRoute>} />
      <Route path="/my-applications" element={<PrivateRoute role="STUDENT"><MyApplications /></PrivateRoute>} />
      <Route path="/application/:id" element={<PrivateRoute><ApplicationDetail /></PrivateRoute>} />
      <Route path="/officer" element={<PrivateRoute role="OFFICER"><OfficerReview /></PrivateRoute>} />
      <Route path="/courses" element={<PrivateRoute role="OFFICER"><CoursesManage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
