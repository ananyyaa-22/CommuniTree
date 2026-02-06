/**
 * VerificationModalDemo Component
 * Demo component for testing VerificationModal functionality
 */

import React, { useState } from 'react';
import { VerificationModal } from './VerificationModal';

export const VerificationModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock verification function
  const handleVerify = async (ngoId: string, darpanId: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation - accept specific test IDs
    const validIds = ['12345', '67890', '11111'];
    return validIds.includes(darpanId);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold track-text mb-4">
          Verification Modal Demo
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Click the button below to test the verification modal.
          </p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="track-button px-6 py-3 rounded-lg font-medium"
          >
            Open Verification Modal
          </button>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>Test Darpan IDs:</strong></p>
            <p>• Valid: 12345, 67890, 11111</p>
            <p>• Invalid: Any other 5-digit number</p>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={isModalOpen}
        ngoId="ngo_demo_123"
        ngoName="Demo NGO for Testing"
        onClose={() => setIsModalOpen(false)}
        onVerify={handleVerify}
      />
    </div>
  );
};

export default VerificationModalDemo;