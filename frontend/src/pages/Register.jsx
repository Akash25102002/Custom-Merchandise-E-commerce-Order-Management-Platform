import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ChevronDown, ChevronUp } from 'lucide-react';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsSubmitting(true);

    // Clean address details if they weren't entered
    const payload = { ...data };
    if (!payload.phone) delete payload.phone;
    
    const hasAddress = Object.values(payload.address || {}).some(val => val.trim() !== '');
    if (!hasAddress) {
      delete payload.address;
    }

    const result = await registerAuth(payload);
    setIsSubmitting(false);

    if (result?.success) {
      navigate('/');
    } else {
      setApiError(result?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-slate-900 text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Or{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Phone Number <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Collapsible Address Section */}
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAddress(!showAddress)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
              >
                <span>Add Shipping Address (Optional)</span>
                {showAddress ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAddress && (
                <div className="mt-3 space-y-3 pl-1 transition-all">
                  <div>
                    <label htmlFor="street" className="block text-xs font-medium text-slate-500">
                      Street Address
                    </label>
                    <input
                      id="street"
                      type="text"
                      {...register('address.street')}
                      className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-xs font-medium text-slate-500">
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        {...register('address.city')}
                        className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-xs font-medium text-slate-500">
                        State / Province
                      </label>
                      <input
                        id="state"
                        type="text"
                        {...register('address.state')}
                        className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="zipCode" className="block text-xs font-medium text-slate-500">
                        ZIP / Postal Code
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        {...register('address.zipCode')}
                        className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-xs font-medium text-slate-500">
                        Country
                      </label>
                      <input
                        id="country"
                        type="text"
                        {...register('address.country')}
                        className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
