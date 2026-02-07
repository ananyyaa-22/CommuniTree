/**
 * ProfileEditForm Component - User profile editing functionality
 * 
 * Features:
 * - Form validation and error handling
 * - Profile update functions
 * - Real-time validation feedback
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { User } from '../../types';

interface ProfileEditFormProps {
  user: User;
  className?: string;
}

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  user, 
  className = '' 
}) => {
  const { updateProfile, loading: userLoading, error: userError } = useUser();
  const [formData, setFormData] = useState<FormData>({
    name: user.name,
    email: user.email,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show user-level errors if they exist
  useEffect(() => {
    if (userError) {
      setErrors({ 
        name: userError.message 
      });
    }
  }, [userError]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Hide success message when user makes changes
    if (showSuccess) {
      setShowSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the updateProfile function from useUser hook (now integrated with Supabase)
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ 
        name: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: user.name,
      email: user.email,
    });
    setErrors({});
    setShowSuccess(false);
  };

  const hasChanges = formData.name !== user.name || formData.email !== user.email;

  return (
    <div className={`max-w-2xl ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Profile</h3>
        <p className="text-gray-600">
          Update your personal information and account details.
        </p>
      </div>

      {/* Loading Indicator */}
      {userLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-800 font-medium">
              Updating profile...
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-800 font-medium">
              Profile updated successfully!
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.name 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
              }
            `}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <div className="mt-1 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-600">{errors.name}</p>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.email 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
              }
            `}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <div className="mt-1 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-600">{errors.email}</p>
            </div>
          )}
        </div>

        {/* Account Information (Read-only) */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Trust Points</p>
              <p className="font-medium text-gray-900">{user.trustPoints}</p>
            </div>
            <div>
              <p className="text-gray-600">Verification Status</p>
              <p className={`font-medium ${
                user.verificationStatus === 'verified' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {user.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Member Since</p>
              <p className="font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-900">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || isSubmitting}
            className="
              flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 
              rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            disabled={!hasChanges || isSubmitting || userLoading}
            className="
              flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting || userLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;