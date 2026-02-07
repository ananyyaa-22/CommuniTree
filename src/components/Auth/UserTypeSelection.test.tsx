/**
 * UserTypeSelection Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserTypeSelection } from './UserTypeSelection';

describe('UserTypeSelection Component', () => {
  test('renders user type selection screen', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText('Welcome to CommuniTree')).toBeInTheDocument();
    expect(screen.getByText(/Are you joining as an individual or representing an NGO/i)).toBeInTheDocument();
  });

  test('displays both solo user and NGO options', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText('Solo User')).toBeInTheDocument();
    expect(screen.getByText('NGO')).toBeInTheDocument();
  });

  test('calls onSelectUserType with "solo" when solo user is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    const soloButton = screen.getByText('Solo User').closest('button');
    fireEvent.click(soloButton!);
    
    expect(mockOnSelect).toHaveBeenCalledWith('solo');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('calls onSelectUserType with "ngo" when NGO is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    const ngoButton = screen.getByText('NGO').closest('button');
    fireEvent.click(ngoButton!);
    
    expect(mockOnSelect).toHaveBeenCalledWith('ngo');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('displays descriptive text for solo users', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText(/I'm an individual looking to volunteer/i)).toBeInTheDocument();
  });

  test('displays descriptive text for NGOs', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText(/I represent an organization seeking volunteers/i)).toBeInTheDocument();
  });

  test('displays info section explaining user types', () => {
    const mockOnSelect = jest.fn();
    render(<UserTypeSelection onSelectUserType={mockOnSelect} />);
    
    expect(screen.getByText(/Solo Users/i)).toBeInTheDocument();
    expect(screen.getByText(/NGOs/i)).toBeInTheDocument();
  });
});
