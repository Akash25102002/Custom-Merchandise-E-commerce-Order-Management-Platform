import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products Catalog', path: '/admin/products', icon: Package },
    { label: 'Order Fulfillment', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Customer Base', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-canvas text-ink">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-warm-grey-light flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo & Admin Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center text-canvas shadow-md">
              <ShieldCheck className="w-5 h-5 text-canvas" />
            </div>
            <div>
              <h2 className="font-extrabold text-ink text-base">Admin Portal</h2>
              <span className="text-[10px] text-warm-grey font-bold tracking-wider uppercase">
                ThreadCraft Control
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-ink text-canvas shadow-sm'
                      : 'text-warm-grey hover:text-ink hover:bg-warm-grey-subtle'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Back to Store */}
        <div className="space-y-4 pt-6 border-t border-warm-grey-light">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-warm-grey hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <div className="flex items-center justify-between bg-warm-grey-subtle p-3 rounded-2xl border border-warm-grey-light">
            <div className="flex items-center gap-2.5">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full ring-2 ring-warm-grey-light object-cover"
              />
              <div className="text-left">
                <p className="text-xs font-extrabold text-ink">{user?.name}</p>
                <p className="text-[10px] text-thread-green font-bold">Administrator</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-warm-grey hover:text-print-red p-1 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
