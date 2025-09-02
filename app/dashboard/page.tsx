'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useAdmin } from '../components/AdminContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import DashboardSidebar from '../components/DashboardSidebar';
import { moveToTrash, restoreDocument, getUserTrashDocuments } from '../firebase/documents';

type TabType = 'assignments' | 'presentations' | 'trash' | 'analytics';

export default function DashboardPage() {
  const { user, documents, deleteDocument, moveToTrash, restoreDocument, refreshDocuments, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('presentations');
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [trashDocs, setTrashDocs] = useState<typeof documents>([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const fetchTrash = async () => {
    if (!user) return;
    const list = await getUserTrashDocuments(user.id);
    setTrashDocs(list);
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && activeTab === 'trash') {
      fetchTrash();
      setSelected({});
      setSelectAll(false);
    }
  }, [user, activeTab]);

  const getFilteredDocuments = () => {
    if (activeTab === 'trash') return trashDocs;
    return documents.filter(doc => {
      if (activeTab === 'assignments') return doc.type === 'assignment';
      if (activeTab === 'presentations') return doc.type === 'presentation';
      return false;
    });
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const openAnalyticsModal = (doc: any) => {
    setSelectedDocument(doc);
    setShowAnalyticsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const currentDocuments = getFilteredDocuments();

  return (
    <div className="h-screen bg-white flex">
      {/* Left Sidebar - Using separate component */}
      <DashboardSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Recents</h1>
          
          {/* Action Buttons - Pitch.com Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/presentation-canvas" className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">New Presentation Editor</h3>
              <p className="text-sm text-gray-600">Drag-and-drop text elements with formatting</p>
            </Link>

            <button className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Start new presentation</h3>
              <p className="text-sm text-gray-600">Start from a template or prompt</p>
            </button>

            <button className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Create new room</h3>
              <p className="text-sm text-gray-600">Set up a space for prospects and clients</p>
            </button>

            <button className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Import presentation</h3>
              <p className="text-sm text-gray-600">Add PowerPoint files to Pitch</p>
            </button>
          </div>

          {/* Content Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 w-fit">
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700">
              By me
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900">
              By everyone
            </button>
          </div>

          {/* Content Cards Grid - Pitch.com Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    doc.type === 'assignment' ? 'bg-green-100' : 'bg-indigo-100'
                  }`}>
                    <svg className={`w-8 h-8 ${
                      doc.type === 'assignment' ? 'text-green-600' : 'text-indigo-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.title || 'Untitled presentation'}</h3>
                  <p className="text-sm text-gray-500 mb-2">In Private</p>
                  <p className="text-xs text-gray-400">Updated {formatDate(doc.createdAt)}</p>
                </div>
              </div>
            ))}
            
            {/* Demo cards like Pitch.com */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-indigo-100">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Untitled presentation</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 51 minutes ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-green-100">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Untitled room</h3>
                <p className="text-sm text-gray-500 mb-2">In Team</p>
                <p className="text-xs text-gray-400">Updated 52 minutes ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-indigo-100">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Untitled presentation</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
          </div>
        </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Impress every client</h3>
                  </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Wow clients at every step</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Improve collaboration</h3>
                  </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Level up team collaboration</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Enable your sales team</h3>
                      </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                    </div>
                      </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Help sales win more deals</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
                    </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Stay on brand</h3>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Keep your team on brand</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
            </div>
          </div>
          </div>
          </div>
        </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
                </div>
                <button 
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
          </div>

                <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedDocument.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedDocument.createdAt)}</p>
                    </div>
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