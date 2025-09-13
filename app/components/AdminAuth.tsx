'use client';

import { useState } from 'react';
import { useAdmin } from './AdminContext';
import { useAuth } from './AuthContext';

interface AdminAuthProps {
  onAuth: () => void;
}

export default function AdminAuth({ onAuth }: AdminAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginAsAdmin } = useAdmin();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Use the admin context for authentication
    if (loginAsAdmin(email, password)) {
      // Admin will be automatically redirected, so we don't need to call onAuth
      // The redirect happens in the AdminContext
    } else {
      // Show specific error based on what's wrong
      if (email !== 'ahmadmuaaz292@gmail.com') {
        setError('Access denied: This email is not authorized for admin access');
      } else if (user && user.email !== 'ahmadmuaaz292@gmail.com') {
        setError('Access denied: You must be logged in as ahmadmuaaz292@gmail.com to access admin');
      } else {
        setError('Invalid password');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter admin email and password to access template management
          </p>
          
          {/* Show current user status */}
          {user && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Currently logged in as:</strong> {user.email}
              </p>
              {user.email !== 'ahmadmuaaz292@gmail.com' && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ⚠️ You must be logged in as ahmadmuaaz292@gmail.com to access admin
                </p>
              )}
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter admin email"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            For template submissions, email: templates@yourdomain.com
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook to check admin authentication
export const useAdminAuth = () => {
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    
    const authenticated = localStorage.getItem('admin_authenticated');
    const sessionTime = localStorage.getItem('admin_session_time');
    
    if (!authenticated || !sessionTime) return false;
    
    // Check if session is still valid (24 hours)
    const now = Date.now();
    const sessionAge = now - parseInt(sessionTime);
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxSessionAge) {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_session_time');
      return false;
    }
    
    return true;
  };

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session_time');
    window.location.reload();
  };

  return { isAuthenticated, logout };
}; 