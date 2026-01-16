import React, { useState, useEffect } from 'react';
import { products as localData } from '../../data/products';
import { 
  getAllProducts, addItemToOrder, getCurrentOrder, 
  updateItemQuantity, saveOrder, saveProducts 
} from '../../services/db';

const UserPOS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [customerName, setCustomerName] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Wipes old/broken data and syncs the new Karahi image
      await saveProducts(localData);
      const data = await getAllProducts();
      setProducts(data);
      setCart(await getCurrentOrder());
    };
    init();
  }, []);

  const handleAdd = async (p) => {
    setCart(await addItemToOrder(p));
    setShowCart(true);
  };

  const handleQty = async (id, q) => setCart(await updateItemQuantity(id, q));

  const handleConfirm = async () => {
    if (!customerName.trim()) return alert("Please enter a Customer Name");
    await saveOrder({ customerName });
    setCart({ items: [], total: 0 });
    setCustomerName('');
    setShowCart(false);
    alert("Order Confirmed Successfully!");
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <div className={`pos-container ${showCart ? 'cart-open' : ''}`}>
      {!showCart && (
        <button className="white-cart-fab" onClick={() => setShowCart(true)}>
          <span className="fab-icon">🛒</span>
          {cart.items.length > 0 && <span className="fab-badge">{cart.items.length}</span>}
        </button>
      )}

      <main className="menu-side">
        <header className="menu-header">
          <h1>VIBE<span>POS</span></h1>
          <div className="tabs">
            {categories.map(c => (
              <button 
                key={c} 
                className={`${activeTab === c ? 'active' : ''} cat-btn-${c.toLowerCase()}`} 
                onClick={() => setActiveTab(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </header>

        <div className="product-grid">
          {products.filter(p => activeTab === 'All' || p.category === activeTab).map(p => (
            <div key={p.id} className="product-card">
              <div className="img-container">
                <img src={p.image} alt={p.name} loading="lazy" />
                <button className="quick-add" onClick={() => handleAdd(p)}>+</button>
              </div>
              <div className="product-details">
                <h4 className="professional-title">{p.name}</h4>
                <p className="professional-price">Rs {p.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showCart && <div className="overlay" onClick={() => setShowCart(false)} />}

      <aside className="cart-sidebar">
        <div className="cart-header">
          <h3>Order Review</h3>
          <button className="close-btn" onClick={() => setShowCart(false)}>✕</button>
        </div>
        
        <div className="customer-section">
          <label>Customer Name</label>
          <input 
            className="name-input" 
            placeholder="Type name here..." 
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)} 
          />
        </div>

        <div className="cart-items">
          {cart.items.length === 0 ? <p className="empty-msg">Empty Cart</p> : 
            cart.items.map(item => (
              <div key={item.id} className="cart-row">
                <div className="row-info"><p>{item.name}</p><small>Rs {item.price}</small></div>
                <div className="row-qty">
                  <button onClick={() => handleQty(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQty(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
            ))
          }
        </div>
        <div className="cart-footer">
          <div className="total-box"><span>Grand Total</span><b>Rs {cart.total.toLocaleString()}</b></div>
          <button className="confirm-btn" onClick={handleConfirm} disabled={cart.items.length === 0}>
            FINALIZE ORDER
          </button>
        </div>
      </aside>
    </div>
  );
};

export default UserPOS;