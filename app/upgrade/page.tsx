'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-purple-600' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-purple-600' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="text-sm text-gray-600">Save 15% with yearly</span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Pro Plan */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-orange-600 mb-2">Pro</h3>
              <div className="flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
                <span className="text-sm text-purple-600 font-medium">2-25</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${billingCycle === 'monthly' ? '20' : '17'}
              </div>
              <div className="text-sm text-gray-600 mb-4">per month</div>
              <div className="text-sm text-gray-600 mb-6">Includes 2 seats. Extra seats: $15</div>
              <p className="text-sm text-gray-600 mb-6">For professionals and small teams who need sharp, on-brand decks</p>
              <button className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Choose Pro
              </button>
            </div>

            {/* Features */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Everything in Free, plus:</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  25 analytics links
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  </svg>
                  2 shared pitch rooms
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                  25 external guests
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 text-purple-600 mr-3 font-bold text-lg">Aa</span>
                  Custom fonts
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Unbranded sharing links
                </li>
              </ul>
            </div>
          </div>

          {/* Business Plan */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Business</h3>
              <div className="flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
                <span className="text-sm text-purple-600 font-medium">5-200</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${billingCycle === 'monthly' ? '80' : '68'}
              </div>
              <div className="text-sm text-gray-600 mb-4">per month</div>
              <div className="text-sm text-gray-600 mb-6">Includes 5 seats. Extra seats: $20</div>
              <p className="text-sm text-gray-600 mb-6">For teams that want limitless collaboration and analytics</p>
              <button className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Choose Business
              </button>
            </div>

            {/* Features */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Everything in Pro, plus:</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  Unlimited analytics links
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  </svg>
                  Unlimited shared pitch rooms
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                  Unlimited external guests
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Unlimited version history
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  </svg>
                  Batch create presentations
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">Let's talk</div>
              <p className="text-sm text-gray-600 mb-6">For larger organizations with custom requirements</p>
              <button className="w-full bg-white border border-purple-600 text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors">
                Contact us
              </button>
            </div>

            {/* Features */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Everything in Business, plus:</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  SAML-based SSO
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Dedicated success manager
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Tailored onboarding and training
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
