'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

type TabType = 'all-links' | 'basic-links' | 'advanced-links' | 'private-links' | 'room-links';

interface PresentationLink {
  id: string;
  presentationId: string;
  presentationTitle: string;
  linkName: string;
  visits: number;
  createdBy: {
    name: string;
    avatar: string;
  };
  dateCreated: string;
  type: 'basic' | 'advanced' | 'private';
  analytics?: {
    medianTimeSpent: string;
    medianViewedSlides: number;
    totalSlides: number;
    totalVisits: number;
    activityChart: number[];
  };
}

export default function LinksOverviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all-links');
  const [selectedLink, setSelectedLink] = useState<PresentationLink | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Handle loading state
  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Mock data for demonstration
  const mockLinks: PresentationLink[] = [
    {
      id: '1',
      presentationId: 'p1',
      presentationTitle: 'Sales proposal',
      linkName: 'Q4 Sales Deck',
      visits: 456,
      createdBy: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      dateCreated: '2024-01-15',
      type: 'basic',
      analytics: {
        medianTimeSpent: '2:34min',
        medianViewedSlides: 8,
        totalSlides: 12,
        totalVisits: 456,
        activityChart: [12, 19, 3, 5, 2, 3, 8, 15, 22, 18, 25, 30]
      }
    },
    {
      id: '2',
      presentationId: 'p2',
      presentationTitle: 'Fundraising',
      linkName: 'Series A Pitch',
      visits: 123,
      createdBy: {
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      dateCreated: '2024-01-10',
      type: 'advanced',
      analytics: {
        medianTimeSpent: '4:12min',
        medianViewedSlides: 15,
        totalSlides: 20,
        totalVisits: 123,
        activityChart: [5, 8, 12, 6, 9, 15, 18, 22, 16, 20, 25, 28]
      }
    },
    {
      id: '3',
      presentationId: 'p3',
      presentationTitle: 'Design & Build',
      linkName: 'Product Roadmap',
      visits: 44,
      createdBy: {
        name: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      },
      dateCreated: '2024-01-08',
      type: 'advanced',
      analytics: {
        medianTimeSpent: '1:12min',
        medianViewedSlides: 7,
        totalSlides: 12,
        totalVisits: 44,
        activityChart: [2, 4, 6, 3, 5, 8, 12, 15, 10, 7, 9, 11]
      }
    },
    {
      id: '4',
      presentationId: 'p4',
      presentationTitle: 'Quarterly planning',
      linkName: 'Q1 Planning',
      visits: 89,
      createdBy: {
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
      },
      dateCreated: '2024-01-05',
      type: 'basic'
    }
  ];

  const getFilteredLinks = () => {
    switch (activeTab) {
      case 'basic-links':
        return mockLinks.filter(link => link.type === 'basic');
      case 'advanced-links':
        return mockLinks.filter(link => link.type === 'advanced');
      case 'private-links':
        return mockLinks.filter(link => link.type === 'private');
      case 'room-links':
        return []; // No room links in mock data
      default:
        return mockLinks;
    }
  };

  const handleLinkClick = (link: PresentationLink) => {
    if (link.analytics) {
      setSelectedLink(link);
      setShowAnalytics(true);
    }
  };

  const copyLink = (linkId: string) => {
    const linkUrl = `https://app.pitch.com/p/${linkId}`;
    navigator.clipboard.writeText(linkUrl);
    // You could add a toast notification here
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'basic-links':
        return mockLinks.filter(link => link.type === 'basic').length;
      case 'advanced-links':
        return mockLinks.filter(link => link.type === 'advanced').length;
      case 'private-links':
        return mockLinks.filter(link => link.type === 'private').length;
      case 'room-links':
        return 0;
      default:
        return mockLinks.length;
    }
  };

  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'all-links':
        return 'All presentation links';
      case 'basic-links':
        return 'Basic links';
      case 'advanced-links':
        return 'Advanced links';
      case 'private-links':
        return "Others' private links";
      case 'room-links':
        return 'All room links';
      default:
        return 'Links';
    }
  };


  return (
    <div className="h-screen bg-white flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Back Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Presentations
              </h3>
              <div className="space-y-1">
                {(['all-links', 'basic-links', 'advanced-links', 'private-links'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center justify-between ${
                      activeTab === tab 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{getTabTitle(tab)}</span>
                    <span className="text-xs text-gray-400">({getTabCount(tab)})</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Pitch rooms
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('room-links')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center justify-between ${
                    activeTab === 'room-links' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>All room links</span>
                  <span className="text-xs text-gray-400">(0)</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{getTabTitle(activeTab)}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {getFilteredLinks().length > 0 ? (
            <div className="space-y-4">
              {/* Links Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Presentation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created by
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredLinks().map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-semibold text-sm">
                                  {link.presentationTitle.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {link.presentationTitle}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{link.linkName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleLinkClick(link)}
                              className="flex items-center text-sm text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {link.visits}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="w-6 h-6 rounded-full mr-2"
                                src={link.createdBy.avatar}
                                alt={link.createdBy.name}
                              />
                              <span className="text-sm text-gray-900">{link.createdBy.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(link.dateCreated)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => copyLink(link.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              Copy link
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All your links and insights at a glance
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Open a presentation and create a basic link, or upgrade to premium to create advanced links and collect engagement data.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No links found</h3>
              <p className="text-gray-500">
                {activeTab === 'room-links' 
                  ? 'No room links available yet.' 
                  : 'Create your first presentation link to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && selectedLink && selectedLink.analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedLink.presentationTitle}
                </h3>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Median time spent</span>
                  <span className="font-semibold">{selectedLink.analytics.medianTimeSpent}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Median viewed slides</span>
                  <div className="flex items-center">
                    <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(selectedLink.analytics.medianViewedSlides / selectedLink.analytics.totalSlides) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-sm">
                      {selectedLink.analytics.medianViewedSlides}/{selectedLink.analytics.totalSlides}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Visits total</span>
                  <span className="font-semibold">{selectedLink.analytics.totalVisits}</span>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Activity over time</h4>
                  <div className="flex items-end space-x-1 h-16">
                    {selectedLink.analytics.activityChart.map((value, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 rounded-t"
                        style={{ 
                          height: `${(value / Math.max(...selectedLink.analytics!.activityChart)) * 100}%`,
                          width: '8px'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
