'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const templates = [
    { id: 'assignment', title: 'Assignment', description: 'Create professional assignments and documents', icon: '📝', color: 'from-blue-500 to-blue-600', href: '/assignment-editor' },
    { id: 'presentation', title: 'Presentation', description: 'Create stunning presentations and slides', icon: '📊', color: 'from-purple-500 to-purple-600', href: '/presentation-editor' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal header now handled by global Navbar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Document Maker</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Create Professional Documents & Presentations</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Build beautiful assignments, reports, and presentations with our powerful online editor.
            No downloads required - everything you need is right here in your browser.
          </p>
        </div>

        {/* Template Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={template.href}
              className="block"
              onMouseEnter={() => setHoveredCard(template.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 transform ${hoveredCard === template.id ? 'scale-105 shadow-xl' : 'hover:shadow-lg'}`}>
                <div className={`bg-gradient-to-br ${template.color} p-8 text-white`}>
                  <div className="text-5xl mb-4">{template.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3">{template.title}</h3>
                  <p className="text-blue-100 leading-relaxed">{template.description}</p>
                </div>
                <div className="bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Click to create</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-12">Why Choose Document Maker?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4"><span className="text-2xl">⚡</span></div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Fast & Efficient</h4>
              <p className="text-gray-600">Create professional documents in minutes with our intuitive interface.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🎨</span></div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Beautiful Templates</h4>
              <p className="text-gray-600">Choose from hundreds of professionally designed templates.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4"><span className="text-2xl">☁️</span></div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cloud Sync</h4>
              <p className="text-gray-600">Access your documents anywhere, anytime with cloud synchronization.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}