'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useAdmin } from '../components/AdminContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import { moveToTrash, restoreDocument, getUserTrashDocuments } from '../firebase/documents';

export default function DashboardPage() {
  const { user, documents, deleteDocument, moveToTrash, restoreDocument, refreshDocuments, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'assignment' | 'presentation'>('all');
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [trashDocs, setTrashDocs] = useState<typeof documents>([]);

  const fetchTrash = async () => {
    if (!user) return;
    const list = await getUserTrashDocuments(user.id);
    setTrashDocs(list);
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && showTrash) {
      fetchTrash();
      setSelected({});
      setSelectAll(false);
    }
  }, [user, showTrash]);

  const filteredDocuments = documents.filter(doc => filter === 'all' ? true : doc.type === filter);

  const toggleSelectAll = (checked: boolean, list: typeof documents) => {
    setSelectAll(checked);
    const map: Record<string, boolean> = {};
    list.forEach(d => { map[d.id] = checked; });
    setSelected(map);
  };

  const bulkMoveToTrash = async () => {
    const ids = Object.keys(selected).filter(id => selected[id]);
    if (ids.length === 0) return;
    if (!confirm(`Move ${ids.length} document(s) to Trash?`)) return;
    for (const id of ids) { try { await moveToTrash(id); } catch (e) { console.error(e); } }
    await refreshDocuments();
    if (showTrash) await fetchTrash();
    setSelected({}); setSelectAll(false);
  };

  const bulkRestore = async () => {
    const ids = Object.keys(selected).filter(id => selected[id]);
    if (ids.length === 0) return;
    if (!confirm(`Restore ${ids.length} document(s) from Trash?`)) return;
    for (const id of ids) { try { await restoreDocument(id); } catch (e) { console.error(e); } }
    await refreshDocuments();
    await fetchTrash();
    setSelected({}); setSelectAll(false);
  };

  const bulkDeleteForever = async () => {
    const ids = Object.keys(selected).filter(id => selected[id]);
    if (ids.length === 0) return;
    if (!confirm(`Permanently delete ${ids.length} document(s)? This cannot be undone.`)) return;
    for (const id of ids) { try { await deleteDocument(id); } catch (e) { console.error(e); } }
    await refreshDocuments();
    await fetchTrash();
    setSelected({}); setSelectAll(false);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600 dark:text-gray-400">Loading...</p></div>
      </div>
    );
  }
  if (!user) return null;

  const list = showTrash ? trashDocs : filteredDocuments;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{showTrash ? 'Trash' : 'Document Dashboard'}</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowTrash(false)} className={`px-3 py-1 rounded-lg text-sm ${!showTrash ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>Documents</button>
              <button onClick={() => setShowTrash(true)} className={`px-3 py-1 rounded-lg text-sm ${showTrash ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>Trash</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showTrash && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className={`grid gap-4 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'}`}>
              <Link href="/assignment-editor" className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div><h3 className="font-semibold">Create Assignment</h3><p className="text-blue-100 text-sm">Start a new assignment</p></div>
                </div>
              </Link>
              <Link href="/presentation-editor" className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" /></svg>
                  </div>
                  <div><h3 className="font-semibold">Create Presentation</h3><p className="text-purple-100 text-sm">Design a new presentation</p></div>
                </div>
              </Link>
              {isAdmin && (
                <>
                  <Link href="/template-manager" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <div><h3 className="font-semibold">Template Manager</h3><p className="text-green-100 text-sm">Upload & manage templates</p></div>
                    </div>
                  </Link>
                  <Link href="/admin/template-upload" className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl shadow-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <div><h3 className="font-semibold">Admin Panel</h3><p className="text-red-100 text-sm">Manage templates & users</p></div>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {!showTrash && (
              <>
                <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-sm ${filter==='all'?'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300':'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>All</button>
                <button onClick={() => setFilter('assignment')} className={`px-3 py-1 rounded-lg text-sm ${filter==='assignment'?'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300':'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>Assignments</button>
                <button onClick={() => setFilter('presentation')} className={`px-3 py-1 rounded-lg text-sm ${filter==='presentation'?'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300':'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>Presentations</button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={selectAll} onChange={(e) => toggleSelectAll(e.target.checked, list)} />
              <span>Select all</span>
            </label>
            {!showTrash ? (
              <button onClick={bulkMoveToTrash} className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200">Move to Trash</button>
            ) : (
              <>
                <button onClick={bulkRestore} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200">Restore</button>
                <button onClick={bulkDeleteForever} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Delete Forever</button>
              </>
            )}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4"><svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No {showTrash?'trashed ':''}documents</h3>
            {!showTrash && <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first assignment or presentation to get started</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((doc) => (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={!!selected[doc.id]} onChange={(e) => setSelected(prev => ({ ...prev, [doc.id]: e.target.checked }))} />
                      <span className="capitalize">{doc.type}</span>
                    </label>
                    <span className="text-xs text-gray-500">{formatDate(doc.updatedAt)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{doc.title}</h3>
                  {!showTrash ? (
                    <div className="flex space-x-2">
                      <Link href={`/${doc.type}-editor/editor?id=${doc.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors">Edit</Link>
                      <button onClick={async () => { await moveToTrash(doc.id); await refreshDocuments(); if (showTrash) await fetchTrash(); }} className="px-3 py-2 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors">Trash</button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button onClick={async () => { await restoreDocument(doc.id); await refreshDocuments(); await fetchTrash(); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors">Restore</button>
                      <button onClick={async () => { await deleteDocument(doc.id); await refreshDocuments(); await fetchTrash(); }} className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 