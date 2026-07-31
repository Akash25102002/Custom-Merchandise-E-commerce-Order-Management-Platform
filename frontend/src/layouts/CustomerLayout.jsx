import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, LogOut, Shirt, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-slate-800 transition-colors">
              <Shirt className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                MerchStudio
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Custom Print Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Shirt className="w-4 h-4 text-slate-500" /> Catalog
            </Link>

            <Link
              to="/orders"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-slate-500" /> My Orders
            </Link>

            {/* Cart Button with Count Badge */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Admin Link / Logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  Admin Console
                </Link>
              )}

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Customer'}</p>
                  <p className="text-[10px] text-slate-500">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Page Viewport */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">MerchStudio Production Platform</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> 100% Cotton Guarantee</span>
            <span>Fast Dispatch</span>
            <span>Express Shipping</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
