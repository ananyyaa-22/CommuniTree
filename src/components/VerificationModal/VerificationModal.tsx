/**
 * VerificationModal Component
 * Modal for verifying NGOs using 5-digit Darpan ID input
 * Provides form validation, success/error states, and backdrop functionality
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { isValidDarpanId } from '../../utils/validation';
import { validateDarpanIdDetailed, getVerificationSuccessMessage } from '../../utils/verification';

export interface VerificationModalProps {
  isOpen: boolean;
  ngoId: string;
  ngoName: string;
  onClose: () => void;
  onVerify: (ngoId: string, darpanId: string) => Promise<boolean>;
  className?: string;
}

type VerificationState = 'idle' | 'loading' | 'success' | 'error';

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  ngoId,
  ngoName,
  onClose,
  onVerify,
  className,
}) => {
  const [darpanId, setDarpanId] = useState('');
  const [state, setState] = useState<VerificationState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDarpanId('');
      setState('idle');
      setErrorMessage('');
      setValidationError('');
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numeric input, max 5 digits
    if (value === '' || (/^\d{0,5}$/.test(value))) {
      setDarpanId(value);
      setValidationError('');
      setState('idle');
      setErrorMessage('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with detailed feedback
    const validation = validateDarpanIdDetailed(darpanId);
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    setState('loading');
    setValidationError('');
    setErrorMessage('');

    try {
      const isValid = await onVerify(ngoId, darpanId);
      
      if (isValid) {
        setState('success');
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setState('error');
        setErrorMessage('Invalid Darpan ID. Please check and try again.');
      }
    } catch (error) {
      setState('error');
      setErrorMessage('Verification failed. Please try again later.');
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black bg-opacity-50 backdrop-blur-sm',
        className
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={clsx(
          'relative w-full max-w-md',
          'track-card p-6',
          'transform transition-all duration-200',
          {
            'scale-100 opacity-100': isOpen,
            'scale-95 opacity-0': !isOpen,
          }
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-modal-title"
        aria-describedby="verification-modal-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 track-accent-bg rounded-full">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold track-text" id="verification-modal-title">
                Verify NGO
              </h2>
              <p className="text-sm text-gray-600">
                {ngoName}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={state === 'loading'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {state === 'success' && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Verification Successful!
            </h3>
            <p className="text-sm text-green-600 leading-relaxed">
              {getVerificationSuccessMessage(ngoName, darpanId)}
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                You earned 10 trust points for helping verify this NGO!
              </p>
            </div>
          </div>
        )}

        {/* Form State */}
        {state !== 'success' && (
          <>
            {/* Description */}
            <div className="mb-6" id="verification-modal-description">
              <p className="text-sm text-gray-600 leading-relaxed">
                Enter the 5-digit Darpan ID to verify this NGO's authenticity. 
                This helps ensure you're volunteering with legitimate organizations.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="darpanId" 
                  className="block text-sm font-medium track-text mb-2"
                >
                  Darpan ID
                </label>
                <input
                  id="darpanId"
                  type="text"
                  value={darpanId}
                  onChange={handleInputChange}
                  placeholder="Enter 5-digit ID"
                  maxLength={5}
                  className={clsx(
                    'w-full px-4 py-3 text-center text-lg font-mono',
                    'border rounded-lg transition-colors duration-200',
                    'focus:outline-none focus:ring-2 track-focus-ring',
                    {
                      'border-gray-300 focus:border-transparent': !validationError && state !== 'error',
                      'border-red-300 focus:border-red-500 focus:ring-red-200': validationError || state === 'error',
                      'bg-gray-50': state === 'loading',
                    }
                  )}
                  disabled={state === 'loading'}
                  autoFocus
                />
                
                {/* Validation Error */}
                {validationError && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{validationError}</span>
                  </div>
                )}

                {/* Server Error */}
                {state === 'error' && errorMessage && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={state === 'loading'}
                  className={clsx(
                    'flex-1 px-4 py-3 text-sm font-medium',
                    'border border-gray-300 text-gray-700 rounded-lg',
                    'hover:bg-gray-50 transition-colors duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={state === 'loading' || !darpanId.trim()}
                  className={clsx(
                    'flex-1 px-4 py-3 text-sm font-medium rounded-lg',
                    'track-button flex items-center justify-center space-x-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {state === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Verify NGO</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Info Footer */}
        {state !== 'success' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Darpan ID is a unique 5-digit identifier assigned to NGOs by the Government of India
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;