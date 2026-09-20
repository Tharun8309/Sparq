import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'sparq_cart_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[Cart] Corrupt localStorage cleared:', e.message);
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('[Cart] Failed to persist items:', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product._id);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          sellingPrice: product.sellingPrice,
          actualPrice: product.actualPrice,
          image: product.images?.[0]?.url || '',
          quantity
        }
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setCartItems(prev => prev.map(item => (item.productId === productId ? { ...item, quantity: qty } : item)));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.sellingPrice || 0) * (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
