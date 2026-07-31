import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request Email, 2: Reset Password
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devResetToken, setDevResetToken] = useState('');

  const emailForm = useForm({
    defaultValues: { email: '' },
  });

  const resetForm = useForm({
    defaultValues: { resetToken: '', newPassword: '', confirmPassword: '' },
  });

  const handleRequestToken = async (data) => {
    setApiError('');
    setIsSubmitting(true);
    const result = await forgotPassword(data.email);
    setIsSubmitting(false);

    if (result?.success) {
      setSuccessMessage('Reset instructions have been generated.');
      if (result.resetToken) {
        setDevResetToken(result.resetToken);
        resetForm.setValue('resetToken', result.resetToken);
      }
      setStep(2);
    } else {
      setApiError(result?.message || 'Failed to send reset link. Please try again.');
    }
  };

  const handleResetPassword = async (data) => {
    setApiError('');
    if (data.newPassword !== data.confirmPassword) {
      setApiError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(data.resetToken, data.newPassword);
    setIsSubmitting(false);

    if (result?.success) {
      setSuccessMessage(result.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setApiError(result?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-slate-900 text-white">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            {step === 1 ? 'Forgot your password?' : 'Reset your password'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            {step === 1
              ? 'Enter your email address and we will generate a password reset token for you.'
              : 'Enter your reset token and new password to secure your account.'}
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2" role="alert">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={emailForm.handleSubmit(handleRequestToken)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...emailForm.register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                placeholder="you@example.com"
              />
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{emailForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating token...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Sign in
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={resetForm.handleSubmit(handleResetPassword)}>
            {devResetToken && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-mono break-all">
                <p className="font-semibold text-amber-900 mb-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Development Mode Token Auto-Filled:
                </p>
                {devResetToken}
              </div>
            )}

            <div>
              <label htmlFor="resetToken" className="block text-sm font-medium text-slate-700">
                Reset Token
              </label>
              <input
                id="resetToken"
                type="text"
                {...resetForm.register('resetToken', { required: 'Reset token is required' })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950"
                placeholder="Paste token here"
              />
              {resetForm.formState.errors.resetToken && (
                <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.resetToken.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...resetForm.register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                placeholder="••••••••"
              />
              {resetForm.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...resetForm.register('confirmPassword', { required: 'Please confirm password' })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-950 focus:border-slate-950 sm:text-sm"
                placeholder="••••••••"
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Resetting password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Resend instructions / Change email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
