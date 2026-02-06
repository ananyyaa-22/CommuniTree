/**
 * VerificationModal Component Tests
 * Tests for the NGO verification modal functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VerificationModal } from './VerificationModal';

// Mock props for testing
const mockProps = {
  isOpen: true,
  ngoId: 'ngo_test_123',
  ngoName: 'Test NGO Organization',
  onClose: jest.fn(),
  onVerify: jest.fn(),
};

describe('VerificationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<VerificationModal {...mockProps} />);
    
    expect(screen.getByText('Verify NGO')).toBeInTheDocument();
    expect(screen.getByText('Test NGO Organization')).toBeInTheDocument();
    expect(screen.getByLabelText('Darpan ID')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<VerificationModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Verify NGO')).not.toBeInTheDocument();
  });

  it('validates input format', async () => {
    render(<VerificationModal {...mockProps} />);
    
    const input = screen.getByLabelText('Darpan ID');
    const submitButton = screen.getByRole('button', { name: /verify ngo/i });

    // Test invalid input (letters)
    fireEvent.change(input, { target: { value: 'abc12' } });
    expect(input).toHaveValue('');

    // Test valid input (5 digits)
    fireEvent.change(input, { target: { value: '12345' } });
    expect(input).toHaveValue('12345');

    // Test input too long
    fireEvent.change(input, { target: { value: '123456' } });
    expect(input).toHaveValue('12345'); // Should not change
  });

  it('shows validation error for empty input', async () => {
    render(<VerificationModal {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /verify ngo/i });
    
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Darpan ID is required')).toBeInTheDocument();
  });

  it('shows validation error for invalid format', async () => {
    render(<VerificationModal {...mockProps} />);
    
    const input = screen.getByLabelText('Darpan ID');
    const submitButton = screen.getByRole('button', { name: /verify ngo/i });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Darpan ID must be exactly 5 digits')).toBeInTheDocument();
  });

  it('calls onVerify with correct parameters', async () => {
    const mockOnVerify = jest.fn().mockResolvedValue(true);
    render(<VerificationModal {...mockProps} onVerify={mockOnVerify} />);
    
    const input = screen.getByLabelText('Darpan ID');
    const submitButton = screen.getByRole('button', { name: /verify ngo/i });

    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    
    expect(mockOnVerify).toHaveBeenCalledWith('ngo_test_123', '12345');
  });

  it('shows success state after successful verification', async () => {
    const mockOnVerify = jest.fn().mockResolvedValue(true);
    render(<VerificationModal {...mockProps} onVerify={mockOnVerify} />);
    
    const input = screen.getByLabelText('Darpan ID');
    const submitButton = screen.getByRole('button', { name: /verify ngo/i });

    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Verification Successful!')).toBeInTheDocument();
    });
  });

  it('shows error state after failed verification', async () => {
    const mockOnVerify = jest.fn().mockResolvedValue(false);
    render(<VerificationModal {...mockProps} onVerify={mockOnVerify} />);
    
    const input = screen.getByLabelText('Darpan ID');
    const submitButton = screen.getByRole('button', { name: /verify ngo/i });

    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Darpan ID. Please check and try again.')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(<VerificationModal {...mockProps} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<VerificationModal {...mockProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<VerificationModal {...mockProps} />);
    
    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockProps.onClose).toHaveBeenCalled();
    }
  });

  it('disables buttons during loading state', async () => {
    const mockOnVerify = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    render(<VerificationModal {...mockProps} onVerify={mockOnVerify} />);
    
    const input = screen.getByLabelText('Darpan ID');
    const submitButton = screen.getByRole('button', { name: /verify ngo/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    
    // Check loading state
    expect(screen.getByText('Verifying...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});