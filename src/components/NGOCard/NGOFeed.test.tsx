/**
 * NGOFeed Component Tests
 * Tests for the NGO feed container component functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NGOFeed } from './NGOFeed';
import { AppProvider } from '../../context';
import { NGO } from '../../types';

// Mock NGO data for testing
const mockNGOs: NGO[] = [
  {
    id: 'ngo_1',
    name: 'Green Earth Foundation',
    projectTitle: 'Urban Tree Planting Initiative',
    description: 'Help us plant trees in urban areas to improve air quality and create green spaces.',
    category: 'Environment',
    darpanId: '12345',
    isVerified: true,
    volunteersNeeded: 10,
    currentVolunteers: 3,
    contactInfo: {
      email: 'contact@greenearth.org',
      phone: '+1234567890',
      address: '123 Green Street, Eco City'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'ngo_2',
    name: 'Education for All',
    projectTitle: 'Digital Literacy Program',
    description: 'Teaching digital skills to underserved communities.',
    category: 'Education',
    isVerified: false,
    volunteersNeeded: 5,
    currentVolunteers: 1,
    contactInfo: {
      email: 'info@educationforall.org',
      phone: '+1234567891',
      address: '456 Learning Lane, Knowledge City'
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'ngo_3',
    name: 'Animal Rescue Center',
    projectTitle: 'Pet Adoption Drive',
    description: 'Help us find loving homes for rescued animals.',
    category: 'Animal Welfare',
    isVerified: true,
    volunteersNeeded: 8,
    currentVolunteers: 8,
    contactInfo: {
      email: 'rescue@animalcenter.org',
      phone: '+1234567892',
      address: '789 Pet Street, Animal City'
    },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

// Mock the useNGOs hook
jest.mock('../../hooks', () => ({
  useNGOs: () => ({
    ngos: mockNGOs
  })
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('NGOFeed Component', () => {
  beforeEach(() => {
    // Clear any previous localStorage
    localStorage.clear();
  });

  test('renders NGO feed with correct title and count', () => {
    renderWithProvider(<NGOFeed />);
    
    expect(screen.getByText('NGO Opportunities')).toBeInTheDocument();
    expect(screen.getByText('3 opportunities')).toBeInTheDocument();
  });

  test('displays all NGO cards by default', () => {
    renderWithProvider(<NGOFeed />);
    
    expect(screen.getByText('Green Earth Foundation')).toBeInTheDocument();
    expect(screen.getByText('Education for All')).toBeInTheDocument();
    expect(screen.getByText('Animal Rescue Center')).toBeInTheDocument();
  });

  test('renders NGOs in single column layout', () => {
    renderWithProvider(<NGOFeed />);
    
    // All NGOs should be rendered in single column layout
    expect(screen.getByText('Green Earth Foundation')).toBeInTheDocument();
    expect(screen.getByText('Education for All')).toBeInTheDocument();
    expect(screen.getByText('Animal Rescue Center')).toBeInTheDocument();
  });

  test('filters NGOs by search term', async () => {
    renderWithProvider(<NGOFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search NGOs, projects, or descriptions...');
    
    // Search for "tree"
    fireEvent.change(searchInput, { target: { value: 'tree' } });
    
    await waitFor(() => {
      expect(screen.getByText('Green Earth Foundation')).toBeInTheDocument();
      expect(screen.queryByText('Education for All')).not.toBeInTheDocument();
      expect(screen.queryByText('Animal Rescue Center')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('1 opportunity')).toBeInTheDocument();
  });

  test('filters NGOs by category', async () => {
    renderWithProvider(<NGOFeed />);
    
    // Open filters
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Select Education category
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Education' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Green Earth Foundation')).not.toBeInTheDocument();
      expect(screen.getByText('Education for All')).toBeInTheDocument();
      expect(screen.queryByText('Animal Rescue Center')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('1 opportunity')).toBeInTheDocument();
  });

  test('filters verified NGOs only', async () => {
    renderWithProvider(<NGOFeed />);
    
    // Open filters
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Check verified only checkbox
    const verifiedCheckbox = screen.getByLabelText('Verified NGOs only');
    fireEvent.click(verifiedCheckbox);
    
    await waitFor(() => {
      expect(screen.getByText('Green Earth Foundation')).toBeInTheDocument();
      expect(screen.queryByText('Education for All')).not.toBeInTheDocument();
      expect(screen.getByText('Animal Rescue Center')).toBeInTheDocument();
    });
    
    expect(screen.getByText('2 opportunities')).toBeInTheDocument();
  });

  test('sorts NGOs by different criteria', async () => {
    renderWithProvider(<NGOFeed />);
    
    // Open filters
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Sort by volunteers needed
    const sortSelect = screen.getByDisplayValue('Name');
    fireEvent.change(sortSelect, { target: { value: 'volunteersNeeded' } });
    
    await waitFor(() => {
      const ngoCards = screen.getAllByText(/Foundation|Education|Center/);
      // Animal Rescue Center should be first (0 volunteers needed)
      // Education for All should be second (4 volunteers needed)  
      // Green Earth Foundation should be last (7 volunteers needed)
      expect(ngoCards[0]).toHaveTextContent('Animal Rescue Center');
    });
  });

  test('shows no results message when no NGOs match filters', async () => {
    renderWithProvider(<NGOFeed />);
    
    const searchInput = screen.getByPlaceholderText('Search NGOs, projects, or descriptions...');
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No NGOs Found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters to see more opportunities.')).toBeInTheDocument();
    });
  });

  test('clears all filters when clear button is clicked', async () => {
    renderWithProvider(<NGOFeed />);
    
    // Apply some filters
    const searchInput = screen.getByPlaceholderText('Search NGOs, projects, or descriptions...');
    fireEvent.change(searchInput, { target: { value: 'tree' } });
    
    // Open filters and apply category filter
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Environment' } });
    
    // Clear all filters
    const clearButton = screen.getByText('Clear all');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(categorySelect).toHaveValue('all');
      expect(screen.getByText('3 opportunities')).toBeInTheDocument();
    });
  });

  test('calls onChatOpen when volunteer button is clicked', () => {
    const mockOnChatOpen = jest.fn();
    renderWithProvider(<NGOFeed onChatOpen={mockOnChatOpen} />);
    
    // Find and click a volunteer button
    const volunteerButtons = screen.getAllByText('Volunteer');
    fireEvent.click(volunteerButtons[0]);
    
    expect(mockOnChatOpen).toHaveBeenCalledWith(mockNGOs[0]);
  });

  test('shows filter count badge when filters are active', async () => {
    renderWithProvider(<NGOFeed />);
    
    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search NGOs, projects, or descriptions...');
    fireEvent.change(searchInput, { target: { value: 'tree' } });
    
    // Open filters and apply verification filter
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    const verifiedCheckbox = screen.getByLabelText('Verified NGOs only');
    fireEvent.click(verifiedCheckbox);
    
    await waitFor(() => {
      // Should show badge with count of active filters
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});