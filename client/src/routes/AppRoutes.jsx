import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import ProductListingPage from '../features/products/ProductListingPage';
import ProductDetailPage from '../features/products/ProductDetailPage';
import CustomizerStudioPage from '../features/customizer/CustomizerStudioPage';
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/orders/CheckoutPage';
import OrdersPage from '../features/orders/OrdersPage';
import OrderDetailPage from '../features/orders/OrderDetailPage';
import PublicTrackingPage from '../features/shipping/PublicTrackingPage';
import NotFoundPage from '../features/common/NotFoundPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import AdminProductListPage from '../features/admin/AdminProductListPage';
import AdminOrdersPage from '../features/admin/AdminOrdersPage';
import AdminCustomersPage from '../features/admin/AdminCustomersPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Public & Protected Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<ProductListingPage />} />
        <Route path="shop" element={<ProductListingPage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="customizer" element={<CustomizerStudioPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="track" element={<PublicTrackingPage />} />
        <Route path="track/:trackingId" element={<PublicTrackingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        {/* Centralized 404 for Customer Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductListPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Root Fallback 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
