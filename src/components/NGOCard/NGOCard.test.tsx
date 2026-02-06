/**
 * NGOCard Component Tests
 * Tests for NGO card display and interaction functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NGOCard } from './NGOCard';
import { NGO } from '../../types';

// Mock NGO data for testing
const mockVerifiedNGO: NGO = {
  id: 'ngo_001',
  name: 'Green Earth Foundation',
  projectTitle: 'Community Garden Initiative',
  description: 'Help us create sustainable community gardens in urban areas. We need volunteers for planting, maintenance, and educational workshops.',
  darpanId: '12345',
  isVerified: true,
  contactInfo: {
    email: 'contact@greenearth.org',
    phone: '+91-9876543210',
    website: 'https://greenearth.org',
    address: '123 Green Street, Mumbai, Maharashtra',
  },
  category: 'Environment',
  volunteersNeeded: 15,
  currentVolunteers: 8,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-10'),
};

const mockUnverifiedNGO: NGO = {
  ...mockVerifiedNGO,
  id: 'ngo_002',
  name: 'Education for All',
  projectTitle: 'Digital Literacy Program',
  darpanId: undefined,
  isVerified: false,
};

const mockFullyStaffedNGO: NGO = {
  ...mockVerifiedNGO,
  id: 'ngo_003',
  volunteersNeeded: 10,
  currentVolunteers: 10,
};

describe('NGOCard', () => {
  it('renders NGO information correctly', () => {
    render(<NGOCard ngo={mockVerifiedNGO} />);
    
    expect(screen.getByText('Green Earth Foundation')).toBeInTheDocument();
    expect(screen.getByText('Community Garden Initiative')).toBeInTheDocument();
    expect(screen.getByText('Environment')).toBeInTheDocument();
    expect(screen.getByText(/Help us create sustainable community gardens/)).toBeInTheDocument();
  });

  it('displays verification badge for verified NGOs', () => {
    render(<NGOCard ngo={mockVerifiedNGO} />);
    
    expect(screen.getByText('Darpan ID Verified')).toBeInTheDocument();
    expect(screen.queryByText('Verify NGO')).not.toBeInTheDocument();
  });

  it('displays verify button for unverified NGOs', () => {
    const mockOnVerify = jest.fn();
    render(<NGOCard ngo={mockUnverifiedNGO} onVerify={mockOnVerify} />);
    
    expect(screen.getByText('Verify NGO')).toBeInTheDocument();
    expect(screen.queryByText('Darpan ID Verified')).not.toBeInTheDocument();
  });

  it('calls onVerify when verify button is clicked', () => {
    const mockOnVerify = jest.fn();
    render(<NGOCard ngo={mockUnverifiedNGO} onVerify={mockOnVerify} />);
    
    fireEvent.click(screen.getByText('Verify NGO'));
    expect(mockOnVerify).toHaveBeenCalledWith('ngo_002');
  });

  it('calls onVolunteer when volunteer button is clicked', () => {
    const mockOnVolunteer = jest.fn();
    render(<NGOCard ngo={mockVerifiedNGO} onVolunteer={mockOnVolunteer} />);
    
    fireEvent.click(screen.getByText('Volunteer'));
    expect(mockOnVolunteer).toHaveBeenCalledWith(mockVerifiedNGO);
  });

  it('displays volunteer count correctly', () => {
    render(<NGOCard ngo={mockVerifiedNGO} />);
    
    expect(screen.getByText('8/15')).toBeInTheDocument();
    expect(screen.getByText('7 volunteers needed')).toBeInTheDocument();
  });

  it('shows fully staffed state correctly', () => {
    render(<NGOCard ngo={mockFullyStaffedNGO} />);
    
    expect(screen.getByText('Fully Staffed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fully Staffed/ })).toBeDisabled();
  });

  it('renders in grid view by default', () => {
    const { container } = render(<NGOCard ngo={mockVerifiedNGO} />);
    
    // Check for grid-specific classes
    expect(container.querySelector('.flex-col')).toBeInTheDocument();
  });

  it('renders in list view when specified', () => {
    const { container } = render(<NGOCard ngo={mockVerifiedNGO} viewMode="list" />);
    
    // Check for list-specific classes
    expect(container.querySelector('.flex-row')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<NGOCard ngo={mockVerifiedNGO} className="custom-class" />);
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});