/**
 * NGOCardDemo Component
 * Demonstrates NGOCard functionality with sample data
 */

import React, { useState } from 'react';
import { NGOCard } from './NGOCard';
import { NGO, ViewMode } from '../../types';

const sampleNGOs: NGO[] = [
  {
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
  },
  {
    id: 'ngo_002',
    name: 'Education for All',
    projectTitle: 'Digital Literacy Program',
    description: 'Teaching basic computer skills to underprivileged children. Join us in bridging the digital divide.',
    darpanId: undefined,
    isVerified: false,
    contactInfo: {
      email: 'info@educationforall.org',
      phone: '+91-9876543211',
      address: '456 Learning Lane, Delhi',
    },
    category: 'Education',
    volunteersNeeded: 20,
    currentVolunteers: 12,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'ngo_003',
    name: 'Animal Care Society',
    projectTitle: 'Street Animal Rescue',
    description: 'Rescue, treat, and rehabilitate street animals. We need volunteers for feeding, medical care, and adoption drives.',
    darpanId: '67890',
    isVerified: true,
    contactInfo: {
      email: 'help@animalcare.org',
      phone: '+91-9876543212',
      website: 'https://animalcare.org',
      address: '789 Care Street, Bangalore, Karnataka',
    },
    category: 'Animal Welfare',
    volunteersNeeded: 10,
    currentVolunteers: 10, // Fully staffed
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-08'),
  },
];

export const NGOCardDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleVerify = (ngoId: string) => {
    console.log('Verify NGO:', ngoId);
    alert(`Verification requested for NGO: ${ngoId}`);
  };

  const handleVolunteer = (ngo: NGO) => {
    console.log('Volunteer for NGO:', ngo.name);
    alert(`Opening chat with ${ngo.name}`);
  };

  const toggleViewMode = () => {
    setViewMode(current => current === 'grid' ? 'list' : 'grid');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold track-text">NGO Card Demo</h2>
        <button
          onClick={toggleViewMode}
          className="track-button px-4 py-2 rounded-md"
        >
          Switch to {viewMode === 'grid' ? 'List' : 'Grid'} View
        </button>
      </div>

      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }`}>
        {sampleNGOs.map((ngo) => (
          <NGOCard
            key={ngo.id}
            ngo={ngo}
            viewMode={viewMode}
            onVerify={handleVerify}
            onVolunteer={handleVolunteer}
          />
        ))}
      </div>

      <div className="mt-8 p-4 track-bg rounded-lg">
        <h3 className="text-lg font-semibold track-text mb-2">Demo Features:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Verified NGO:</strong> Green Earth Foundation shows verification badge</li>
          <li>• <strong>Unverified NGO:</strong> Education for All shows verify button</li>
          <li>• <strong>Fully Staffed:</strong> Animal Care Society shows disabled volunteer button</li>
          <li>• <strong>Responsive Design:</strong> Toggle between grid and list views</li>
          <li>• <strong>Track Theming:</strong> Uses track-based color scheme</li>
        </ul>
      </div>
    </div>
  );
};

export default NGOCardDemo;