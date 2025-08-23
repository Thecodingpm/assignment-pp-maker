'use client';

import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Document Maker</Link>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4 sm:space-x-8">
                <Link href="/about" className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium">About</Link>
                <Link href="/contact" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Contact
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">About Document Maker</h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            A powerful online tool for creating professional documents and presentations
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Document Maker was created to provide students, professionals, and anyone who needs to create 
            high-quality documents and presentations with a simple, powerful, and accessible tool. 
            We believe that great content creation shouldn&apos;t require expensive software or complex learning curves.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Our platform combines the best features of traditional word processors and presentation software 
            with modern web technologies to deliver a seamless experience across all devices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Assignment Editor</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Create professional assignments, reports, and documents with our rich text editor. 
              Features include formatting options, image insertion, and real-time collaboration.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Presentation Maker</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Build stunning presentations with our slide-based editor. Add slides, format content, 
              and create professional presentations in minutes.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✨ Easy to Use</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Intuitive interface designed for users of all skill levels</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💾 Auto Save</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Never lose your work with automatic saving</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📱 Responsive</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Works perfectly on desktop, tablet, and mobile</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🚀 Fast</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Built with modern technologies for optimal performance</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔒 Secure</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Your data stays private and secure</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💻 No Downloads</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Everything runs in your browser, no installation required</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start Creating
          </Link>
        </div>
      </main>
    </div>
  );
}