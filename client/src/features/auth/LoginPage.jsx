import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Shirt, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (emailToSubmit, passwordToSubmit) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: emailToSubmit,
        password: passwordToSubmit,
      });

      const { user, accessToken } = response.data;
      setAuth(user, accessToken);

      // Redirect logic: customer -> /shop, admin -> /admin/dashboard
      const fromPath = location.state?.from?.pathname;
      if (fromPath && fromPath !== '/login') {
        navigate(fromPath, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/shop', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }
    handleLogin(email, password);
  };

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@threadcraft.com');
      setPassword('Admin@123456');
      handleLogin('admin@threadcraft.com', 'Admin@123456');
    } else {
      setEmail('customer@threadcraft.com');
      setPassword('Customer@123456');
      handleLogin('customer@threadcraft.com', 'Customer@123456');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fadeIn py-8">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/25">
            <Shirt className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to ThreadCraft</h2>
          <p className="text-xs text-slate-400">Access custom merchandise studio, saved designs, and tracking timeline.</p>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>One-Click Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('customer')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="customer@threadcraft.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading} icon={LogIn} size="lg">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300">
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
