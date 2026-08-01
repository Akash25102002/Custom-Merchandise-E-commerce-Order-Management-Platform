import { create } from 'zustand';
import api from '../api/axios';

export const useCartStore = create((set, get) => ({
  cartItems: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  cart: null,
  isOpen: false,
  isLoading: false,

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await api.get('/cart');
      const cart = res.data.data.cart;
      const items = cart?.items || [];
      localStorage.setItem('cartItems', JSON.stringify(items));
      set({ cart, cartItems: items });
    } catch (err) {
      console.error('Failed to fetch cart in store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (itemPayload) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const currentItems = get().cartItems;
      const updatedItems = [...currentItems, { ...itemPayload, id: 'cart_' + Date.now() }];
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      set({ cartItems: updatedItems });
      return;
    }

    try {
      await api.post('/cart', itemPayload);
      await get().fetchCart();
    } catch (err) {
      console.error('Failed to add item to cart via API:', err);
      throw err;
    }
  },

  removeItem: async (id) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const updatedItems = get().cartItems.filter((item) => item.id !== id && item._id !== id);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      set({ cartItems: updatedItems });
      return;
    }

    try {
      await api.delete(`/cart/${id}`);
      await get().fetchCart();
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      throw err;
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(id);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      const updatedItems = get().cartItems.map((item) =>
        (item.id === id || item._id === id) ? { ...item, quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      set({ cartItems: updatedItems });
      return;
    }

    try {
      await api.put(`/cart/${id}`, { quantity });
      await get().fetchCart();
    } catch (err) {
      console.error('Failed to update cart item quantity:', err);
      throw err;
    }
  },

  clearCart: () => {
    localStorage.removeItem('cartItems');
    set({ cartItems: [], cart: null });
  },

  getSubtotal: () => {
    if (get().cart?.subtotal !== undefined) {
      return get().cart.subtotal;
    }
    return get().cartItems.reduce(
      (total, item) => total + (item.unitPrice || item.price || 0) * item.quantity,
      0
    );
  },
}));

