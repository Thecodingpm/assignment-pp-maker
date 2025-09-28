'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export default function SessionWarningModal() {
  const { showSessionWarning, extendSession, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState(60); // 1 hour in minutes
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showSessionWarning) {
      setIsVisible(true);
      // Start countdown from 60 minutes
      setTimeLeft(60);
    } else {
      setIsVisible(false);
    }
  }, [showSessionWarning]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Session expired, logout
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [isVisible, logout]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Expiring Soon
            </h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your session will expire in <span className="font-semibold text-yellow-600 dark:text-yellow-400">{formatTime(timeLeft)}</span> due to inactivity.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click "Extend Session" to continue working, or you'll be automatically logged out.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={logout}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={extendSession}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
}
