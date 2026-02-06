/**
 * Authentication container component
 * Manages the flow between login and registration forms
 */

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegistrationForm } from './RegistrationForm';
import { User } from '../../types';

interface AuthContainerProps {
  onAuthComplete: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  onAuthComplete,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleAuthComplete = (user: User) => {
    onAuthComplete(user);
  };

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">CT</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CommuniTree</h1>
          <p className="text-gray-600">Connect. Contribute. Grow.</p>
        </div>

        {/* Authentication Forms */}
        {mode === 'login' ? (
          <LoginForm
            onLoginComplete={handleAuthComplete}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegistrationForm
            onRegistrationComplete={handleAuthComplete}
            onSwitchToLogin={switchToLogin}
          />
        )}

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