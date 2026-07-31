import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('merch_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('merch_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem) => {
    setCartItems((prev) => {
      // Generate a unique ID for each customized item based on configuration signature
      const itemKey = `${newItem.product._id}-${newItem.customization.color}-${newItem.customization.size}-${newItem.customization.printArea}-${newItem.customization.customText || ''}-${newItem.customization.logoUrl ? 'logo' : 'nologo'}`;
      
      const existingIndex = prev.findIndex((i) => i.cartItemId === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: Number((existing.unitPrice * newQty).toFixed(2)),
        };
        return updated;
      }

      return [
        ...prev,
        {
          ...newItem,
          cartItemId: itemKey,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: Number((item.unitPrice * newQuantity).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Summary statistics
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = Number(
    cartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
