/**
 * User Type Selection Component
 * First step in authentication flow - allows users to select if they're
 * part of an NGO or a solo user before proceeding to sign in/sign up
 */

import React from 'react';
import { Users, User, Building2, Heart } from 'lucide-react';

export type UserType = 'solo' | 'ngo';

interface UserTypeSelectionProps {
  onSelectUserType: (userType: UserType) => void;
}

export const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({
  onSelectUserType,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to CommuniTree</h2>
        <p className="text-gray-600 text-lg">
          Let's get started! Are you joining as an individual or representing an NGO?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solo User Option */}
        <button
          onClick={() => onSelectUserType('solo')}
          className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200 hover:border-emerald-400 rounded-xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Solo User</h3>
              <p className="text-gray-700 leading-relaxed">
                I'm an individual looking to volunteer with NGOs or join local events
              </p>
            </div>
            <div className="flex items-center space-x-2 text-emerald-700 font-medium">
              <Heart className="w-5 h-5" />
              <span>Join as Volunteer</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </button>

        {/* NGO Option */}
        <button
          onClick={() => onSelectUserType('ngo')}
          className="group relative bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-200 hover:border-amber-400 rounded-xl p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-700 transition-colors">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">NGO</h3>
              <p className="text-gray-700 leading-relaxed">
                I represent an organization seeking volunteers for community projects
              </p>
            </div>
            <div className="flex items-center space-x-2 text-amber-700 font-medium">
              <Users className="w-5 h-5" />
              <span>Join as Organization</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <strong>Solo Users</strong> can volunteer with NGOs and attend local events.
              <br />
              <strong>NGOs</strong> can post volunteer opportunities and manage community projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
