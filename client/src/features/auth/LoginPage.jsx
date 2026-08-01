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
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-warm-grey-light space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center text-canvas mx-auto shadow-md">
            <Shirt className="w-6 h-6 text-canvas" />
          </div>
          <h2 className="text-2xl font-extrabold text-ink">Sign In to ThreadCraft</h2>
          <p className="text-xs text-warm-grey">Access custom merchandise studio, saved designs, and tracking timeline.</p>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="p-3.5 rounded-2xl bg-canvas border border-warm-grey-light space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>One-Click Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('customer')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-warm-grey-subtle text-[11px] font-bold text-ink border border-warm-grey-light transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-thread-green" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-warm-grey-subtle text-[11px] font-bold text-ink border border-warm-grey-light transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-ink" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-print-red-light border border-print-red/30 text-print-red text-xs font-bold flex items-center gap-2">
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

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={LogIn} size="lg">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-warm-grey font-medium">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-ink underline hover:text-print-red">
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
