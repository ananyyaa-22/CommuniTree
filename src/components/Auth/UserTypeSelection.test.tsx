/**
 * UserTypeSelection Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserTypeSelection } from './UserTypeSelection';

describe('UserTypeSelection Component', () => {
  test('renders with correct title and subtitle', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText('Join CommuniTree')).toBeInTheDocument();
    expect(screen.getByText('How would you like to continue?')).toBeInTheDocument();
  });

  test('displays both NGO and volunteer options', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText('I represent an NGO')).toBeInTheDocument();
    expect(screen.getByText('I want to volunteer')).toBeInTheDocument();
  });

  test('displays NGO descriptions', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText(/Post opportunities and find the right volunteers/i)).toBeInTheDocument();
    expect(screen.getByText(/Organize activities and grow your impact/i)).toBeInTheDocument();
  });

  test('displays volunteer descriptions', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText(/Find meaningful opportunities near you/i)).toBeInTheDocument();
    expect(screen.getByText(/Give your time, make a difference/i)).toBeInTheDocument();
  });

  test('calls onSelectUserType with "ngo" when NGO card is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    const ngoButton = screen.getByText('I represent an NGO').closest('button');
    fireEvent.click(ngoButton!);
    
    expect(mockOnSelect).toHaveBeenCalledWith('ngo');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('calls onSelectUserType with "solo" when volunteer card is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    const volunteerButton = screen.getByText('I want to volunteer').closest('button');
    fireEvent.click(volunteerButton!);
    
    expect(mockOnSelect).toHaveBeenCalledWith('solo');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('renders with proper styling classes', () => {
    const mockOnSelect = jest.fn();
    const { container } = render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    // Check for single column layout
    const cards = container.querySelectorAll('button');
    expect(cards).toHaveLength(2);
    
    // Check for proper spacing
    const cardContainer = container.querySelector('.space-y-4');
    expect(cardContainer).toBeInTheDocument();
  });
});
