import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="leaf">🌿</span>
        Fresh<span className="accent">Mart</span>
      </div>

      {user && (
        <ul className="nav-links">
          <li><NavLink to="/products">🛍 Products</NavLink></li>
          <li>
            <NavLink to="/cart" className="nav-cart-badge">
              🛒 Cart
              {totalItems > 0 && <span className="nav-cart-count">{totalItems}</span>}
            </NavLink>
          </li>
          <li><NavLink to="/orders">📦 Orders</NavLink></li>
          <li><NavLink to="/delivery">🚚 Delivery</NavLink></li>
          <li><div className="nav-divider" /></li>
          <li>
            <div className="nav-user-pill">
              <div className="nav-user-dot" />
              {user.name || user.username}
            </div>
          </li>
          <li>
            <button className="nav-logout" onClick={() => { logout(); navigate('/login'); }}>
              ↩ Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
