import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🌿 Fresh<span>Mart</span>
      </div>
      {user && (
        <ul className="navbar-links">
          <li><NavLink to="/products">🛍️ Products</NavLink></li>
          <li>
            <NavLink to="/cart" className="cart-badge">
              🛒 Cart
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </NavLink>
          </li>
          <li><NavLink to="/orders">📦 Orders</NavLink></li>
          <li><NavLink to="/delivery">🚚 Delivery</NavLink></li>
          <li>
            <span className="navbar-user">👤 {user.name || user.username}</span>
          </li>
          <li>
            <button onClick={handleLogout} style={{ color: '#f87171' }}>Logout</button>
          </li>
        </ul>
      )}
    </nav>
  );
}
