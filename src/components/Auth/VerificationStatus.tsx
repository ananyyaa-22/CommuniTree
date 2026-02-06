/**
 * Identity verification status component
 * Shows current verification status and allows document upload
 */

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  FileText, 
  X 
} from 'lucide-react';
import { useUser } from '../../hooks/useUser';

interface VerificationStatusProps {
  className?: string;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  className = '' 
}) => {
  const { user, updateUser } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (!user) return null;

  const getStatusConfig = () => {
    switch (user.verificationStatus) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Identity Verified',
          description: 'Your identity has been successfully verified.',
          showUploadButton: false,
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Verification Pending',
          description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
          showUploadButton: false,
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Verification Required',
          description: 'Please upload your identity document to complete verification.',
          showUploadButton: true,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Simulate document upload and processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user verification status to pending
      await updateUser({
        verificationStatus: 'pending',
        updatedAt: new Date(),
      });

      // Simulate verification processing (in real app, this would be done by backend)
      setTimeout(async () => {
        await updateUser({
          verificationStatus: 'verified',
          trustPoints: user.trustPoints + 10, // Award trust points for verification
          updatedAt: new Date(),
        });
      }, 5000); // Simulate 5 second processing time

      setShowUploadModal(false);
    } catch (error) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className={`p-4 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}`}>
        <div className="flex items-start space-x-3">
          <StatusIcon className={`w-6 h-6 ${statusConfig.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <h3 className={`font-medium ${statusConfig.color}`}>
              {statusConfig.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {statusConfig.description}
            </p>
            {statusConfig.showUploadButton && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Identity Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Please upload one of the following documents:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Government-issued ID card</li>
                  <li>Passport</li>
                  <li>Driver's license</li>
                  <li>Voter ID card</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  id="verification-document"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="verification-document"
                  className={`cursor-pointer flex flex-col items-center ${
                    isUploading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <FileText className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 text-center">
                        Click to upload or drag and drop<br />
                        JPG, PNG, or PDF (max 5MB)
                      </span>
                    </>
                  )}
                </label>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {uploadError}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p className="mb-1">
                  <strong>Privacy Notice:</strong> Your document will be securely processed 
                  for identity verification only. We use industry-standard encryption and 
                  do not store your documents after verification is complete.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};