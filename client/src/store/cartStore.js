import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cartItems: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  isOpen: false,

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (item) => {
    const currentItems = get().cartItems;
    // Check if matching product + color + size + artwork exists
    const existingIndex = currentItems.findIndex(
      (i) =>
        i.product._id === item.product._id &&
        i.color.name === item.color.name &&
        i.size === item.size &&
        JSON.stringify(i.customization) === JSON.stringify(item.customization)
    );

    let updatedItems = [];
    if (existingIndex > -1) {
      updatedItems = [...currentItems];
      updatedItems[existingIndex].quantity += item.quantity || 1;
    } else {
      updatedItems = [...currentItems, { ...item, id: 'cart_' + Date.now() }];
    }

    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    set({ cartItems: updatedItems, isOpen: true });
  },

  removeItem: (id) => {
    const updatedItems = get().cartItems.filter((item) => item.id !== id);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    set({ cartItems: updatedItems });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    const updatedItems = get().cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    set({ cartItems: updatedItems });
  },

  clearCart: () => {
    localStorage.removeItem('cartItems');
    set({ cartItems: [] });
  },

  getSubtotal: () => {
    return get().cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
}));
