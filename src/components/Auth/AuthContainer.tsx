/**
 * Authentication container component
 * Manages the flow between user type selection, login and registration forms
 */

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegistrationForm } from './RegistrationForm';
import { UserTypeSelection, UserType } from './UserTypeSelection';
import { User } from '../../types';
import { ArrowLeft } from 'lucide-react';

interface AuthContainerProps {
  onAuthComplete: (user: User) => void;
  initialMode?: 'login' | 'register';
}

type AuthStep = 'userType' | 'login' | 'register';

export const AuthContainer: React.FC<AuthContainerProps> = ({
  onAuthComplete,
  initialMode = 'login',
}) => {
  const [step, setStep] = useState<AuthStep>('userType');
  const [userType, setUserType] = useState<UserType | null>(null);

  const handleUserTypeSelect = (selectedType: UserType) => {
    setUserType(selectedType);
    setStep(initialMode);
  };

  const handleAuthComplete = (user: User) => {
    // Add userType to user object if needed for future use
    const userWithType = {
      ...user,
      accountType: userType,
    };
    onAuthComplete(userWithType);
  };

  const switchToLogin = () => setStep('login');
  const switchToRegister = () => setStep('register');
  const goBackToUserType = () => {
    setStep('userType');
    setUserType(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo/Brand Section - Only show on user type selection */}
        {step === 'userType' && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl mb-6 shadow-lg">
              <span className="text-3xl font-bold text-white">CT</span>
            </div>
          </div>
        )}

        {/* Back Button - Show when not on user type selection */}
        {step !== 'userType' && (
          <div className="mb-6">
            <button
              onClick={goBackToUserType}
              className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to role selection</span>
            </button>
          </div>
        )}

        {/* Authentication Flow */}
        <div className="flex justify-center">
          {step === 'userType' ? (
            <UserTypeSelection onSelectUserType={handleUserTypeSelect} />
          ) : (
            <div className="w-full max-w-md">
              {/* Logo for auth forms */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">CT</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">CommuniTree</h1>
                <p className="text-gray-600">Connect. Contribute. Grow.</p>
              </div>

              {step === 'login' ? (
                <LoginForm
                  onLoginComplete={handleAuthComplete}
                  onSwitchToRegister={switchToRegister}
                  userType={userType}
                />
              ) : (
                <RegistrationForm
                  onRegistrationComplete={handleAuthComplete}
                  onSwitchToLogin={switchToLogin}
                  userType={userType}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};