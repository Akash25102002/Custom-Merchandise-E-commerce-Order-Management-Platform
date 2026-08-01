import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, Palette, Shirt, User, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export const CustomerLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cartItems, toggleCart } = useCartStore();
  const navigate = useNavigate();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                ThreadCraft
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-sky-400 block -mt-1">
                Custom Studio
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link to="/products" className="text-slate-300 hover:text-sky-400 transition-colors">
              Catalog
            </Link>
            <Link
              to="/customizer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Design Studio</span>
            </Link>
            <Link to="/orders" className="text-slate-300 hover:text-sky-400 transition-colors">
              Track Orders
            </Link>
          </nav>

          {/* User Controls & Cart */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Auth User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <div className="flex items-center gap-2.5">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full ring-2 ring-sky-500/40 object-cover"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-200">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 transition-colors"
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
      <footer className="border-t border-slate-900 bg-slate-950/80 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 ThreadCraft Custom Merchandise & Print Studio. All rights reserved.</p>
          <p className="text-slate-600">Built with React, Express, MongoDB, Tailwind CSS & Zustand.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
