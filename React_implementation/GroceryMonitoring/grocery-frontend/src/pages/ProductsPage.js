import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORY_ICONS = {
  fruits: '🍎', vegetables: '🥦', dairy: '🥛', bakery: '🍞',
  meat: '🥩', beverages: '🧃', snacks: '🍿', frozen: '🧊',
  grains: '🌾', default: '🛒'
};

function getCategoryIcon(cat) {
  if (!cat) return CATEGORY_ICONS.default;
  const key = cat.toLowerCase();
  for (const k in CATEGORY_ICONS) {
    if (key.includes(k)) return CATEGORY_ICONS[k];
  }
  return CATEGORY_ICONS.default;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    getAllProducts()
      .then(res => setProducts(res.data))
      .catch(() => setError('Could not load products. Make sure your backend is running on port 8080.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.productCategory).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.productCategory === activeCategory;
    const matchSearch = !search || p.productName?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product.productId);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (loading) return (
    <div className="page">
      <div className="spinner-wrap"><div className="spinner" /><p>Loading fresh products...</p></div>
    </div>
  );

  return (
    <div className="page">
      <div className="hero">
        <h2>Fresh Groceries</h2>
        <p>Browse our wide selection of fresh fruits, vegetables, dairy and more — delivered to your door.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        {categories.map(cat => (
          <button key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}>
            {cat !== 'All' ? getCategoryIcon(cat) + ' ' : ''}{cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>No products found</h3>
          <p>Try a different search or category</p>
        </div>
      ) : (
        <div className="grid-4">
          {filtered.map(product => (
            <div key={product.productId} className="product-card">
              <div className="product-img">
                {getCategoryIcon(product.productCategory)}
              </div>
              <div className="product-body">
                <div className="product-category">{product.productCategory}</div>
                <div className="product-name">{product.productName}</div>
                <div className="product-details">{product.productDetails}</div>
                <div className="product-footer">
                  <div>
                    <div className="product-price">₹{product.productPrice?.toFixed(2)}</div>
                    <div className="product-stock">
                      {product.productQuantity > 0
                        ? `${product.productQuantity} in stock`
                        : <span style={{ color: 'var(--red)' }}>Out of stock</span>}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={product.productQuantity <= 0}
                    onClick={() => handleAdd(product)}
                    style={addedId === product.productId ? { background: 'var(--green-light)' } : {}}
                  >
                    {addedId === product.productId ? '✓ Added' : '+ Add'}
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
