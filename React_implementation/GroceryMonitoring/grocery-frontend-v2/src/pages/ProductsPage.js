import React, { useState, useEffect, useRef } from 'react';
import { getAllProducts } from '../services/api';
import { useCart } from '../context/CartContext';

const CAT_EMOJI = {
  fruits: '🍎', fruit: '🍎',
  vegetables: '🥦', vegetable: '🥦',
  dairy: '🥛',
  bakery: '🍞', bread: '🍞',
  meat: '🥩',
  beverages: '🧃', beverage: '🧃',
  snacks: '🍿', snack: '🍿',
  frozen: '🧊',
  grains: '🌾', grain: '🌾', rice: '🌾',
  grocery: '🛒', groceries: '🛒',
};

function getEmoji(cat) {
  if (!cat) return '🛒';
  const k = cat.toLowerCase();
  for (const key in CAT_EMOJI) { if (k.includes(key)) return CAT_EMOJI[key]; }
  return '🛒';
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dropOpen, setDropOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const dropRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    getAllProducts()
      .then(r => setProducts(r.data))
      .catch(() => setError('Could not load products. Ensure backend is running on port 8080.'))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.productCategory).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.productCategory === activeCategory;
    const matchSearch = !search || p.productName?.toLowerCase().includes(search.toLowerCase()) ||
                        p.productCategory?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product.productId);
    setTimeout(() => setAddedId(null), 1200);
  };

  const selectCategory = (cat) => { setActiveCategory(cat); setDropOpen(false); };

  if (loading) return (
    <div className="page"><div className="spinner-wrap"><div className="spinner" /><p>Loading fresh products…</p></div></div>
  );

  return (
    <div className="page">
      {/* HERO */}
      <div className="hero">
        <div className="hero-pattern">🌿</div>
        <div className="hero-content">
          <div className="hero-tag">✦ Fresh · Local · Organic</div>
          <h2>Shop <em>Fresh</em> Groceries</h2>
          <p>Browse our handpicked selection of fresh produce, dairy, and pantry staples — delivered to your door.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search products…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* CATEGORY DROPDOWN */}
        <div className="cat-dropdown-wrap" ref={dropRef}>
          <button className={`cat-dropdown-btn ${dropOpen ? 'open' : ''}`} onClick={() => setDropOpen(!dropOpen)}>
            <span>
              {activeCategory === 'All' ? '🗂 All Categories' : `${getEmoji(activeCategory)} ${activeCategory}`}
            </span>
            <span className="chevron">▼</span>
          </button>

          {dropOpen && (
            <div className="cat-dropdown-menu">
              {categories.map(cat => (
                <div key={cat} className={`cat-option ${activeCategory === cat ? 'selected' : ''}`}
                  onClick={() => selectCategory(cat)}>
                  <span>{cat === 'All' ? '🗂' : getEmoji(cat)}</span>
                  <span>{cat}</span>
                  {activeCategory === cat && <span className="check">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-pale)', whiteSpace: 'nowrap' }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* PRODUCTS GRID */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="emo">🔍</div>
          <h3>No products found</h3>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(p => (
            <div key={p.productId} className="prod-card">
              <div className="prod-img-wrap">
                <div className="prod-emoji">{getEmoji(p.productCategory)}</div>
              </div>
              <div className="prod-body">
                <div className="prod-cat-tag">{getEmoji(p.productCategory)} {p.productCategory}</div>
                <div className="prod-name">{p.productName}</div>
                <div className="prod-detail">{p.productDetails}</div>
                <div className="prod-footer">
                  <div className="prod-price-wrap">
                    <div className="prod-price">₹{p.productPrice?.toFixed(2)}</div>
                    <div className={`prod-stock ${p.productQuantity <= 0 ? 'out' : p.productQuantity <= 5 ? 'low' : ''}`}>
                      {p.productQuantity <= 0 ? 'Out of stock' : p.productQuantity <= 5 ? `Only ${p.productQuantity} left!` : `${p.productQuantity} in stock`}
                    </div>
                  </div>
                  <button
                    className={`add-btn ${addedId === p.productId ? 'added' : ''}`}
                    disabled={p.productQuantity <= 0}
                    onClick={() => handleAdd(p)}
                  >
                    {addedId === p.productId ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
