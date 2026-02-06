/**
 * NGOCardContainer Component
 * Container component that connects NGOCard to global state and handles actions
 */

import React, { useCallback, useState } from 'react';
import { NGOCard, NGOCardProps } from './NGOCard';
import { VerificationModal } from '../VerificationModal';
import { useNGOs, useUI, useTrustPoints } from '../../hooks';
import { NGO } from '../../types';

export interface NGOCardContainerProps extends Omit<NGOCardProps, 'onVerify' | 'onVolunteer'> {
  onChatOpen?: (ngo: NGO) => void;
}

export const NGOCardContainer: React.FC<NGOCardContainerProps> = ({
  ngo,
  viewMode,
  className,
  onChatOpen,
}) => {
  const { verifyNGO } = useNGOs();
  const { showModal, addNotification } = useUI();
  const { awardPoints } = useTrustPoints();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const handleVerify = useCallback((ngoId: string) => {
    setIsVerificationModalOpen(true);
  }, []);

  const handleVerificationSubmit = useCallback(async (ngoId: string, darpanId: string): Promise<boolean> => {
    try {
      // Call the verification function from the NGO hook
      const result = await verifyNGO(ngoId, darpanId);
      
      if (result) {
        // Award trust points for successful verification
        awardPoints('VERIFY_IDENTITY');
        
        // Close modal after successful verification
        setTimeout(() => {
          setIsVerificationModalOpen(false);
        }, 2000);
      }
      
      return result;
    } catch (error) {
      console.error('Verification failed:', error);
      
      // Add error notification
      addNotification({
        type: 'system',
        title: 'Verification Error',
        message: 'An unexpected error occurred during verification. Please try again.',
        timestamp: new Date(),
        isRead: false,
      });
      
      return false;
    }
  }, [verifyNGO, awardPoints, addNotification]);

  const handleVerificationClose = useCallback(() => {
    setIsVerificationModalOpen(false);
  }, []);

  const handleVolunteer = useCallback((ngo: NGO) => {
    // Open chat modal for volunteer communication
    if (onChatOpen) {
      onChatOpen(ngo);
    } else {
      // Fallback: show chat modal
      showModal('chat');
    }
  }, [onChatOpen, showModal]);

  return (
    <>
      <NGOCard
        ngo={ngo}
        viewMode={viewMode}
        onVerify={handleVerify}
        onVolunteer={handleVolunteer}
        className={className}
      />
      
      <VerificationModal
        isOpen={isVerificationModalOpen}
        ngoId={ngo.id}
        ngoName={ngo.name}
        onClose={handleVerificationClose}
        onVerify={handleVerificationSubmit}
      />
    </>
  );
};

export default NGOCardContainer;