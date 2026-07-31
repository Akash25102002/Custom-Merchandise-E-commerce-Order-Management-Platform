import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import CustomerLayout from '../layouts/CustomerLayout';
import Storefront from '../pages/Storefront';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import AdminOrders from '../pages/admin/AdminOrders';
import Categories from '../pages/admin/Categories';
import Products from '../pages/admin/Products';
import ProductForm from '../pages/admin/ProductForm';

// Protected Route Guard (Requires logged-in user)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route Guard (Requires logged-in admin)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Guard (Redirects away from Login/Register if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }
  
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />



      {/* Customer Pages */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Storefront />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
      </Route>

      {/* Admin Nested Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route 
          path="customers" 
          element={
            <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900 font-sans">Customers</h1>
              <p className="mt-2 text-slate-600">Customer profiles directory coming soon.</p>
            </div>
          } 
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
export { ProtectedRoute, AdminRoute, PublicRoute };
