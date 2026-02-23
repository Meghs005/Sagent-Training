import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span className="brand-serif">Edu</span><span className="brand-accent">Admit</span>
        </Link>
      </div>
      {currentUser ? (
        <div className="nav-links">
          {currentUser.role === 'STUDENT' && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
              <Link to="/apply" className={isActive('/apply') ? 'active' : ''}>Apply</Link>
              <Link to="/my-applications" className={isActive('/my-applications') ? 'active' : ''}>My Applications</Link>
            </>
          )}
          {currentUser.role === 'OFFICER' && (
            <>
              <Link to="/officer" className={isActive('/officer') ? 'active' : ''}>Review Applications</Link>
              <Link to="/courses" className={isActive('/courses') ? 'active' : ''}>Manage Courses</Link>
            </>
          )}
          <div className="nav-user">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
          <button className="btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login" className={isActive('/login') ? 'active' : ''}>Sign In</Link>
          <Link to="/register"><button className="btn-primary btn-sm">Register</button></Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
