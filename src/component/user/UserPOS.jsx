import React, { useState } from 'react';
import { products } from '../../data/products';
import { saveOrder } from '../../services/db'; // Connects to your backend logic

const UserPOS = () => {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isOrdering, setIsOrdering] = useState(false);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredItems = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);

    const newOrder = {
      orderId: `VIBE-${Date.now()}`,
      items: cart,
      total: total,
      status: 'pending', // This allows Admin to see it as "Pending"
      createdAt: new Date().toISOString(),
    };

    try {
      // Saves to IndexedDB - App.js handleOnline will sync this to Admin
      await saveOrder(newOrder); 
      alert("✅ VIBE RECEIVED! Sending to kitchen...");
      setCart([]);
    } catch (error) {
      alert("❌ System Error: Could not save order.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="logo-text"><h1>VIBE</h1></div>
        <div className="status">PK 🇵🇰</div>
      </header>

      <div className="category-container">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="product-card">
            <div className="img-wrapper">
              <img src={item.image} alt={item.name} />
              <button className="add-btn" onClick={() => addToCart(item)}>+</button>
            </div>
            <div className="product-info">
              <div className="product-name">{item.name}</div>
              <div className="product-price">Rs {item.price.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed-cart">
          <div className="bill-details">
            <span className="label">TOTAL BILL</span>
            <span className="amount">Rs {total.toLocaleString()}</span>
          </div>
          <button className="checkout-btn" onClick={handlePlaceOrder} disabled={isOrdering}>
            {isOrdering ? 'SENDING...' : `CHECKOUT (${cart.reduce((a, b) => a + b.qty, 0)})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPOS;