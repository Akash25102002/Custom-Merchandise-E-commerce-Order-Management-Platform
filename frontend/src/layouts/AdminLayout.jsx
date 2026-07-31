import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderClosed, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Store, 
  Users, 
  ClipboardList 
} from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Categories', to: '/admin/categories', icon: FolderClosed },
    { name: 'Products', to: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', to: '/admin/orders', icon: ClipboardList },
    { name: 'Customers', to: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center border-b border-slate-800 space-x-2">
          <ShoppingBag className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-tight">Merch Admin</span>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="font-semibold text-sm truncate text-white">{user?.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded font-medium capitalize">
            {user?.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Store className="mr-3 h-5 w-5" />
            Go to Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-800">Admin Control Panel</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">{new Date().toDateString()}</span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
