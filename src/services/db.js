import { openDB } from 'idb';

const DB_NAME = 'vibe_pos_db';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('currentOrder')) db.createObjectStore('currentOrder', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('orders')) db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
    },
  });
};

export const saveProducts = async (products) => {
  const db = await initDB();
  const tx = db.transaction('products', 'readwrite');
  const store = tx.objectStore('products');
  await store.clear(); // Prevents duplicates by wiping old data first
  for (const p of products) {
    await store.put(p);
  }
  await tx.done;
};

export const getAllProducts = async () => {
  const db = await initDB();
  return await db.getAll('products');
};

export const getCurrentOrder = async () => {
  const db = await initDB();
  return await db.get('currentOrder', 'active') || { id: 'active', items: [], total: 0 };
};

export const addItemToOrder = async (product) => {
  const order = await getCurrentOrder();
  const existing = order.items.find(item => item.id === product.id);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    order.items.push({ ...product, quantity: 1 });
  }
  
  order.total = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const db = await initDB();
  await db.put('currentOrder', order);
  return order;
};

export const updateItemQuantity = async (productId, qty) => {
  const order = await getCurrentOrder();
  if (qty <= 0) {
    order.items = order.items.filter(i => i.id !== productId);
  } else {
    const item = order.items.find(i => i.id === productId);
    if (item) item.quantity = qty;
  }
  order.total = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const db = await initDB();
  await db.put('currentOrder', order);
  return order;
};

export const saveOrder = async (customerData) => {
  const order = await getCurrentOrder();
  const db = await initDB();
  await db.add('orders', { ...order, ...customerData, date: new Date().toISOString() });
  const reset = { id: 'active', items: [], total: 0 };
  await db.put('currentOrder', reset);
  return reset;
};