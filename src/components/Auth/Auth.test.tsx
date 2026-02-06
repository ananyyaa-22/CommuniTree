/**
 * Authentication components tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContainer } from './AuthContainer';
import { AppProvider } from '../../context';

// Mock user for testing
const mockUser = {
  id: 'user_test',
  name: 'Test User',
  email: 'test@example.com',
  trustPoints: 50,
  verificationStatus: 'pending' as const,
  chatHistory: [],
  eventHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Authentication Components', () => {
  const mockOnAuthComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthContainer', () => {
    it('should render login form by default', () => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} />
        </AppProvider>
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your CommuniTree account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('should switch to registration form when clicking Create Account', () => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} />
        </AppProvider>
      );

      const createAccountButton = screen.getByText('Create Account');
      fireEvent.click(createAccountButton);

      expect(screen.getByText('Join CommuniTree')).toBeInTheDocument();
      expect(screen.getByText('Create your account to start connecting with your community')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    });

    it('should switch back to login form when clicking Sign In', () => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} initialMode="register" />
        </AppProvider>
      );

      // Should start with registration form
      expect(screen.getByText('Join CommuniTree')).toBeInTheDocument();

      const signInButton = screen.getByText('Sign In');
      fireEvent.click(signInButton);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should display CommuniTree branding', () => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} />
        </AppProvider>
      );

      expect(screen.getByText('CommuniTree')).toBeInTheDocument();
      expect(screen.getByText('Connect. Contribute. Grow.')).toBeInTheDocument();
    });
  });

  describe('Login Form', () => {
    it('should validate required fields', async () => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} />
        </AppProvider>
      );

      const signInButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} />
        </AppProvider>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const signInButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should show demo credentials', () => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} />
        </AppProvider>
      );

      expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
      expect(screen.getByText(/alex\.johnson@example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/password123/)).toBeInTheDocument();
    });
  });

  describe('Registration Form', () => {
    beforeEach(() => {
      render(
        <AppProvider>
          <AuthContainer onAuthComplete={mockOnAuthComplete} initialMode="register" />
        </AppProvider>
      );
    });

    it('should validate required fields', async () => {
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Identity verification document is required')).toBeInTheDocument();
      });
    });

    it('should validate name length', async () => {
      const nameInput = screen.getByPlaceholderText('Enter your full name');
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });

      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.click(createAccountButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(createAccountButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should show file upload area', () => {
      expect(screen.getByText('Upload ID, Passport, or Driver\'s License (JPG, PNG, PDF)')).toBeInTheDocument();
      expect(screen.getByText(/Your document will be securely processed for identity verification/)).toBeInTheDocument();
    });
  });
});