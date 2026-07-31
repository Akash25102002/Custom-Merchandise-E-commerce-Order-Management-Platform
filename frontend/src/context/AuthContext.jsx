import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Verify token and load full user details from server on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response?.success) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Failed to verify session token:', error.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response?.success) {
        const { user: loggedInUser, token, refreshToken } = response.data;
        setUser(loggedInUser);
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return { success: true, user: loggedInUser };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response?.success) {
        const { user: registeredUser, token, refreshToken } = response.data;
        setUser(registeredUser);
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(registeredUser));
        return { success: true, user: registeredUser };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout notification to backend failed or unneeded:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response?.success) {
        return { 
          success: true, 
          message: response.message, 
          resetToken: response.data?.resetToken 
        };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to request password reset' };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { resetToken, newPassword });
      if (response?.success) {
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Password reset failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      forgotPassword, 
      resetPassword, 
      isAdmin: user?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
