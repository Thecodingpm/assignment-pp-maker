'use client';

import { useState } from 'react';
import { useAdmin } from '../../components/AdminContext';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsAdmin, isAdmin } = useAdmin();
  const { user } = useAuth();
  const router = useRouter();

  // If already admin, redirect to admin panel
  if (isAdmin) {
    router.push('/admin/template-upload');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Use the admin context for authentication
    if (loginAsAdmin(email, password)) {
      // Admin will be automatically redirected to admin panel
      // No need to do anything here
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
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access the admin panel with your credentials
          </p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">
            ⚠️ Only authorized admin email can access this panel
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
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
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
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Access Admin Panel'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            For template submissions, email: templates@yourdomain.com
          </p>
          <div className="mt-4">
            <a
              href="/"
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 