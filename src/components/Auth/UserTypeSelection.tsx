/**
 * User Type Selection Component
 * First step in authentication flow - allows users to select if they're
 * part of an NGO or a solo user before proceeding to sign in/sign up
 */

import React from 'react';
import { Building2, Heart } from 'lucide-react';

export type UserType = 'solo' | 'ngo';

interface UserTypeSelectionProps {
  onSelectUserType: (userType: UserType) => void;
}

export const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({
  onSelectUserType,
}) => {
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Join CommuniTree
        </h1>
        <p className="text-xl text-gray-600">
          How would you like to continue?
        </p>
      </div>

      {/* Selection Cards */}
      <div className="space-y-4">
        {/* NGO Card */}
        <button
          onClick={() => onSelectUserType('ngo')}
          className="w-full group bg-white hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 text-left"
        >
          <div className="flex items-start space-x-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-emerald-100 group-hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                <Building2 className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                I represent an NGO
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Post opportunities and find the right volunteers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Organize activities and grow your impact</span>
                </li>
              </ul>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">→</span>
              </div>
            </div>
          </div>
        </button>

        {/* Volunteer Card */}
        <button
          onClick={() => onSelectUserType('solo')}
          className="w-full group bg-white hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 text-left"
        >
          <div className="flex items-start space-x-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-emerald-100 group-hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                <Heart className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                I want to volunteer
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Find meaningful opportunities near you</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Give your time, make a difference</span>
                </li>
              </ul>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">→</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
