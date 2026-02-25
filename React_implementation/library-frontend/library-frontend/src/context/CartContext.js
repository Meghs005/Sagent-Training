import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (book) => {
    setCart(prev => {
      if (prev.find(b => b.bookId === book.bookId)) return prev;
      return [...prev, book];
    });
  };

  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(b => b.bookId !== bookId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
