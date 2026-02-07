/**
 * Password Reset Form Component
 * Handles password reset request flow
 * Integrates with Supabase authentication via useAuth hook
 * 
 * Requirements: 3.5
 */

import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onBackToLogin,
}) => {
  const { resetPassword, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (value: string) => {
    setFormData({ email: value });
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    // Reset success state when user changes email
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      // Send password reset email using Supabase authentication
      await resetPassword(formData.email);
      
      // Show success message
      setSuccess(true);
    } catch (err) {
      // Error is already handled by useAuth hook
      // Display it in the form
      setErrors({ 
        general: err instanceof Error 
          ? err.message 
          : 'Failed to send reset email. Please try again.' 
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        disabled={loading}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Sign In
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {success ? (
        // Success State
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  Reset Email Sent
                </p>
                <p className="text-sm text-green-700">
                  We've sent a password reset link to <strong>{formData.email}</strong>. 
                  Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Didn't receive the email?</strong> Check your spam folder or try again in a few minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        // Form State
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                disabled={loading}
                autoFocus
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* General Error */}
          {(errors.general || authError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.general || authError?.message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      )}
    </div>
  );
};
