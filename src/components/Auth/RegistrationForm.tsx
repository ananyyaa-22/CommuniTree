/**
 * Registration form component for new user signup
 * Handles user registration with name, email, and identity verification
 */

import React, { useState } from 'react';
import { User, Upload, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { validateDocumentFile, processDocumentUpload } from '../../utils/verification';
import { User as UserType } from '../../types';

interface RegistrationFormProps {
  onRegistrationComplete: (user: UserType) => void;
  onSwitchToLogin: () => void;
}

interface FormData {
  name: string;
  email: string;
  identityDocument: File | null;
}

interface FormErrors {
  name?: string;
  email?: string;
  identityDocument?: string;
  general?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegistrationComplete,
  onSwitchToLogin,
}) => {
  const { setUser } = useUser();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    identityDocument: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file using verification utilities
      const validation = validateDocumentFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, identityDocument: validation.error }));
        return;
      }

      setUploadStatus('uploading');
      // Simulate file upload process using verification utilities
      processDocumentUpload(file, 'temp_user_id')
        .then(() => {
          setFormData(prev => ({ ...prev, identityDocument: file }));
          setUploadStatus('success');
          if (errors.identityDocument) {
            setErrors(prev => ({ ...prev, identityDocument: undefined }));
          }
        })
        .catch(() => {
          setUploadStatus('error');
          setErrors(prev => ({ ...prev, identityDocument: 'Upload failed. Please try again.' }));
        });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate API call for registration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new user with initial trust points (50)
      const newUser: UserType = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        trustPoints: 50, // Initial trust points as per requirement
        verificationStatus: 'pending', // Will be verified after document processing
        chatHistory: [],
        eventHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set user in global state
      setUser(newUser);
      
      // Call completion callback
      onRegistrationComplete(newUser);

    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join CommuniTree</h2>
        <p className="text-gray-600">Create your account to start connecting with your community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
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
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Identity Document Upload */}
        <div>
          <label htmlFor="identity-document" className="block text-sm font-medium text-gray-700 mb-1">
            Identity Verification Document
          </label>
          <div className="relative">
            <input
              type="file"
              id="identity-document"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isSubmitting || uploadStatus === 'uploading'}
            />
            <label
              htmlFor="identity-document"
              className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                errors.identityDocument 
                  ? 'border-red-300 bg-red-50' 
                  : uploadStatus === 'success'
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              } ${isSubmitting || uploadStatus === 'uploading' ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className="text-center">
                {uploadStatus === 'uploading' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : uploadStatus === 'success' && formData.identityDocument ? (
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">{formData.identityDocument.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Upload ID, Passport, or Driver's License (JPG, PNG, PDF)
                    </span>
                  </div>
                )}
              </div>
            </label>
          </div>
          {errors.identityDocument && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.identityDocument}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your document will be securely processed for identity verification. Max file size: 5MB.
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {errors.general}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || uploadStatus === 'uploading'}
          className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
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
              disabled={isSubmitting}
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};