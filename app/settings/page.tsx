'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [workspaceName, setWorkspaceName] = useState(`${user?.name}'s team`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
              <span className="ml-2 text-sm text-gray-900">ahmad muaaz' team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Workspace settings</h1>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Workspace Name */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xl">A</span>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Connect Custom Domain */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect a custom domain</h3>
                <p className="text-sm text-gray-600">
                  Share your presentations and pitch rooms on your own domain. Learn more about setting up custom domains.
                </p>
              </div>
              <button className="ml-6 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Upgrade to connect
              </button>
            </div>
          </div>

          {/* Manage Integrations */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Manage integrations</h3>
                <p className="text-sm text-gray-600">
                  See which integrations are connected to your workspace and remove them if they are no longer needed. To learn about all available integrations visit our{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                    Integrations page
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Delete Workspace */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete this workspace permanently</h3>
                <p className="text-sm text-gray-600">
                  You and everyone else in this workspace will lose access to all content. This cannot be undone.
                </p>
              </div>
              <button className="ml-6 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
