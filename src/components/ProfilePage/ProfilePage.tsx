/**
 * ProfilePage Component - Wrapper for UserProfile component
 * 
 * Features:
 * - Full-page profile display
 * - Consistent page layout
 * - Error handling for profile access
 * 
 * Requirements: 10.3
 */

import React from 'react';
import { UserProfile } from '../UserProfile';

export const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <UserProfile />
    </div>
  );
};

export default ProfilePage;