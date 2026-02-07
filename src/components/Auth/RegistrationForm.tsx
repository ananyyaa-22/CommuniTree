/**
 * Registration form component for new user signup
 * Handles user registration with email, password, and display name
 * Integrates with Supabase authentication via useAuth hook
 * 
 * Requirements: 3.1, 3.2
 */

import React, { useState } from 'react';
import { User, Upload, Mail, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { validateDocumentFile, processDocumentUpload } from '../../utils/verification';
import { User as UserType } from '../../types';
import { UserType as AccountType } from './UserTypeSelection';

interface RegistrationFormProps {
  onRegistrationComplete?: (user: UserType) => void;
  onSwitchToLogin: () => void;
  userType: AccountType | null;
}

interface FormData {
  displayName: string;
  email: string;
  organizationName?: string;
  darpanId?: string;
  identityDocument: File | null;
}

interface FormErrors {
  displayName?: string;
  email?: string;
  organizationName?: string;
  darpanId?: string;
  identityDocument?: string;
  general?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegistrationComplete,
  onSwitchToLogin,
  userType,
}) => {
  const { signUp, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    organizationName: '',
    darpanId: '',
    identityDocument: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isNGO = userType === 'ngo';
  const userTypeLabel = isNGO ? 'NGO' : 'Volunteer';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = isNGO ? 'Contact person name is required' : 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // NGO-specific validations
    if (isNGO) {
      if (!formData.organizationName?.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }

      if (!formData.darpanId?.trim()) {
        newErrors.darpanId = 'Darpan ID is required';
      } else if (!/^\d{5}$/.test(formData.darpanId)) {
        newErrors.darpanId = 'Darpan ID must be exactly 5 digits';
      }
    }

    // Identity document validation
    if (!formData.identityDocument) {
      newErrors.identityDocument = 'Identity verification document is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(formData.identityDocument.type)) {
        newErrors.identityDocument = 'Please upload a valid image (JPG, PNG) or PDF file';
      } else if (formData.identityDocument.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.identityDocument = 'File size must be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      // Sign up using Supabase authentication
      await signUp(formData.email, formData.password, formData.displayName);
      
      // If onRegistrationComplete callback is provided, it will be called
      // The user will be available from the useAuth hook after successful signup
    } catch (err) {
      // Error is already handled by useAuth hook
      // Display it in the form
      setErrors({ general: err instanceof Error ? err.message : 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        {userType && (
          <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-3">
            {userTypeLabel}
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join CommuniTree</h2>
        <p className="text-gray-600">
          {isNGO 
            ? 'Register your organization to connect with volunteers' 
            : 'Create your account to start connecting with your community'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NGO Organization Name */}
        {isNGO && (
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.organizationName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your organization name"
                disabled={isSubmitting}
              />
            </div>
            {errors.organizationName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.organizationName}
              </p>
            )}
          </div>
        )}

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {isNGO ? 'Contact Person Name' : 'Full Name'}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.displayName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={isNGO ? 'Enter contact person name' : 'Enter your full name'}
              disabled={isSubmitting}
            />
          </div>
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.displayName}
            </p>
          )}
        </div>

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
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* NGO Darpan ID */}
        {isNGO && (
          <div>
            <label htmlFor="darpanId" className="block text-sm font-medium text-gray-700 mb-1">
              Darpan ID
            </label>
            <input
              type="text"
              id="darpanId"
              value={formData.darpanId}
              onChange={(e) => handleInputChange('darpanId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.darpanId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter 5-digit Darpan ID"
              maxLength={5}
              disabled={isSubmitting}
            />
            {errors.darpanId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.darpanId}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Your organization's 5-digit Darpan registration number
            </p>
          </div>
        )}

        {/* Identity Document Upload */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password (min 8 characters)"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.confirmPassword}
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
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
              disabled={loading}
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};