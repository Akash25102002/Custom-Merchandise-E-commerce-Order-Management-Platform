import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, Palette, Shirt, User, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export const CustomerLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cartItems, fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-warm-grey-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center text-canvas shadow-md group-hover:scale-105 transition-transform">
              <Shirt className="w-5 h-5 text-canvas" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-ink tracking-tight">
                ThreadCraft
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-warm-grey block -mt-1">
                Custom Studio
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
            <Link to="/products" className="text-warm-grey hover:text-ink transition-colors">
              Catalog
            </Link>
            <Link
              to="/customizer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-warm-grey-subtle text-ink border border-warm-grey-light hover:border-ink transition-colors"
            >
              <Sparkles className="w-4 h-4 text-ink" />
              <span>Design Studio</span>
            </Link>
            <Link to="/orders" className="text-warm-grey hover:text-ink transition-colors">
              Track Orders
            </Link>
          </nav>

          {/* User Controls & Cart */}
          <div className="flex items-center gap-4">
            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-canvas border border-warm-grey-light hover:border-ink text-ink transition-all flex items-center justify-center"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-print-red text-white text-[11px] font-extrabold flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Auth User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-warm-grey-light pl-4">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2 rounded-xl bg-warm-grey-subtle text-ink border border-warm-grey-light hover:border-ink text-xs font-bold flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <div className="flex items-center gap-2.5">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full ring-2 ring-warm-grey-light object-cover"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-extrabold text-ink">{user?.name}</p>
                    <p className="text-[10px] text-warm-grey font-semibold capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-warm-grey hover:text-print-red hover:bg-warm-grey-subtle transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-warm-grey-light pl-4">
                <Link
                  to="/login"
                  className="text-xs font-bold px-4 py-2 rounded-xl text-ink hover:bg-warm-grey-subtle transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-print-red hover:bg-print-red-hover text-white shadow-md shadow-print-red/20 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-warm-grey-light bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-warm-grey font-medium space-y-2">
          <p>© 2026 ThreadCraft Custom Merchandise & Print Studio. All rights reserved.</p>
          <p className="text-warm-grey-dark">Built with React, Express, MongoDB, Tailwind CSS & Zustand.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
