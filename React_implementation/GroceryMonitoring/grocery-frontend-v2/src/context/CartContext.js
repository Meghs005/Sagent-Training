import React, { createContext, useContext, useState } from 'react';
const CartContext = createContext(null);
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const addToCart = (product) => setCartItems(prev => {
    const ex = prev.find(i => i.productId === product.productId);
    if (ex) return prev.map(i => i.productId === product.productId ? { ...i, qty: i.qty + 1 } : i);
    return [...prev, { ...product, qty: 1 }];
  });
  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.productId !== id));
  const updateQty = (id, qty) => { if (qty <= 0) return removeFromCart(id); setCartItems(prev => prev.map(i => i.productId === id ? { ...i, qty } : i)); };
  const clearCart = () => setCartItems([]);
  const cartTotal = cartItems.reduce((s, i) => s + i.productPrice * i.qty, 0);
  return <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartTotal }}>{children}</CartContext.Provider>;
};
export const useCart = () => useContext(CartContext);
