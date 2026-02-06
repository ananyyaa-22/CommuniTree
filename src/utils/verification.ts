/**
 * Identity verification utilities
 * Simulates document processing and verification logic
 */

import { NGO } from '../types';

export interface VerificationDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'uploaded' | 'processing' | 'verified' | 'rejected';
  rejectionReason?: string;
}

export interface VerificationResult {
  success: boolean;
  status: 'verified' | 'rejected';
  reason?: string;
  trustPointsAwarded?: number;
}

/**
 * Simulates document upload processing
 */
export const processDocumentUpload = async (
  file: File,
  userId: string
): Promise<VerificationDocument> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const document: VerificationDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date(),
    status: 'uploaded',
  };

  return document;
};

/**
 * Simulates automated document verification
 * In a real application, this would involve AI/ML processing or manual review
 */
export const verifyDocument = async (
  document: VerificationDocument
): Promise<VerificationResult> => {
  // Simulate processing time (2-5 seconds)
  const processingTime = Math.random() * 3000 + 2000;
  await new Promise(resolve => setTimeout(resolve, processingTime));

  // Simulate verification logic based on file characteristics
  const isValidFileType = ['image/jpeg', 'image/png', 'application/pdf'].includes(document.fileType);
  const isValidFileSize = document.fileSize > 50000 && document.fileSize < 5 * 1024 * 1024; // 50KB - 5MB
  const hasValidFileName = !document.fileName.toLowerCase().includes('test') && 
                          !document.fileName.toLowerCase().includes('sample');

  // Simulate 90% success rate for valid documents
  const verificationSuccess = isValidFileType && isValidFileSize && hasValidFileName && Math.random() > 0.1;

  if (verificationSuccess) {
    return {
      success: true,
      status: 'verified',
      trustPointsAwarded: 10, // Award trust points for successful verification
    };
  } else {
    // Determine rejection reason
    let reason = 'Document could not be verified. Please ensure the image is clear and shows all required information.';
    
    if (!isValidFileType) {
      reason = 'Invalid file type. Please upload a JPG, PNG, or PDF file.';
    } else if (!isValidFileSize) {
      reason = 'File size is too small or too large. Please upload a file between 50KB and 5MB.';
    } else if (!hasValidFileName) {
      reason = 'Please upload an actual identity document, not a test or sample file.';
    }

    return {
      success: false,
      status: 'rejected',
      reason,
    };
  }
};

/**
 * Validates file before upload
 */
export const validateDocumentFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const minSize = 10 * 1024; // 10KB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image (JPG, PNG) or PDF file.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB.',
    };
  }

  if (file.size < minSize) {
    return {
      isValid: false,
      error: 'File size is too small. Please upload a clear image of your document.',
    };
  }

  return { isValid: true };
};

/**
 * Gets verification status display information
 */
export const getVerificationStatusInfo = (status: 'pending' | 'verified' | 'rejected') => {
  switch (status) {
    case 'verified':
      return {
        title: 'Identity Verified',
        description: 'Your identity has been successfully verified.',
        color: 'green',
        canUpload: false,
      };
    case 'pending':
      return {
        title: 'Verification Pending',
        description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
        color: 'yellow',
        canUpload: false,
      };
    default:
      return {
        title: 'Verification Required',
        description: 'Please upload your identity document to complete verification.',
        color: 'red',
        canUpload: true,
      };
  }
};

// NGO Verification Functions (existing functions from the codebase)

/**
 * Checks if an NGO is eligible for verification
 */
export const isEligibleForVerification = (ngo: NGO): boolean => {
  if (ngo.isVerified) return false;
  if (!ngo.name.trim()) return false;
  if (!ngo.projectTitle.trim()) return false;
  if (!ngo.contactInfo.email.trim()) return false;
  return true;
};

/**
 * Gets verification status text for display
 */
export const getVerificationStatusText = (ngo: NGO): string => {
  if (ngo.isVerified) {
    return ngo.darpanId ? `Verified with Darpan ID ${ngo.darpanId}` : 'Verified Organization';
  }
  return 'Unverified Organization';
};

/**
 * Gets verification badge color classes
 */
export const getVerificationBadgeColor = (ngo: NGO): string => {
  return ngo.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
};

/**
 * Validates Darpan ID with detailed feedback
 */
export const validateDarpanIdDetailed = (darpanId: string): { isValid: boolean; message: string } => {
  const trimmed = darpanId.trim();
  
  if (!trimmed) {
    return { isValid: false, message: 'Darpan ID is required' };
  }
  
  if (!/^\d+$/.test(trimmed)) {
    return { isValid: false, message: 'Darpan ID must contain only numbers' };
  }
  
  if (trimmed.length !== 5) {
    return { isValid: false, message: `Darpan ID must be exactly 5 digits (current: ${trimmed.length})` };
  }
  
  return { isValid: true, message: 'Valid Darpan ID format' };
};

/**
 * Gets verification success message
 */
export const getVerificationSuccessMessage = (ngoName: string, darpanId: string): string => {
  return `${ngoName} has been successfully verified with Darpan ID ${darpanId}. This is now confirmed as a legitimate organization.`;
};

/**
 * Gets verification failure message
 */
export const getVerificationFailureMessage = (ngoName: string, darpanId: string): string => {
  return `Unable to verify ${ngoName} with Darpan ID ${darpanId}. Please check the ID and try again.`;
};

/**
 * Checks if verification trust warning should be shown
 */
export const shouldShowVerificationTrustWarning = (trustPoints: number): boolean => {
  return trustPoints < 30;
};

/**
 * Gets trust points message for verification
 */
export const getVerificationTrustPointsMessage = (success: boolean): string => {
  if (success) {
    return 'You earned 10 trust points for helping to verify an NGO!';
  }
  return 'No trust points were deducted for this failed verification attempt.';
};

/**
 * Formats verification timestamp for display
 */
export const formatVerificationTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just verified';
  } else if (diffHours < 24) {
    return `Verified ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `Verified ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return `Verified on ${timestamp.toLocaleDateString()}`;
  }
};