'use client';

import React, { useState, useEffect } from 'react';
// Lexical imports removed

export interface Source {
  id: string;
  type: 'book' | 'journal' | 'website' | 'newspaper' | 'conference' | 'thesis' | 'other';
  author: string;
  title: string;
  year: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  doi?: string;
  isbn?: string;
}

export interface Citation {
  id: string;
  sourceId: string;
  style: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver';
  position: number;
  text: string;
  page?: string;
}

export interface Footnote {
  id: string;
  content: string;
  position: number;
}

export interface Endnote {
  id: string;
  content: string;
  position: number;
}

interface ReferencesManagerProps {
  sources: Source[];
  setSources: (sources: Source[]) => void;
  citations: Citation[];
  setCitations: (citations: Citation[]) => void;
  footnotes: Footnote[];
  setFootnotes: (footnotes: Footnote[]) => void;
  endnotes: Endnote[];
  setEndnotes: (endnotes: Endnote[]) => void;
  showSourceModal: boolean;
  setShowSourceModal: (show: boolean) => void;
  editingSource: Source | null;
  setEditingSource: (source: Source | null) => void;
}

const ReferencesManager: React.FC<ReferencesManagerProps> = ({
  sources,
  setSources,
  citations,
  setCitations,
  footnotes,
  setFootnotes,
  endnotes,
  setEndnotes,
  showSourceModal,
  setShowSourceModal,
  editingSource,
  setEditingSource
}) => {
  const [citationCount, setCitationCount] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver'>('apa');
  const [newSource, setNewSource] = useState<Partial<Source>>({
    type: 'book',
    author: '',
    title: '',
    year: new Date().getFullYear().toString(),
    publisher: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    url: '',
    doi: '',
    isbn: ''
  });

  // Format citation based on style
  const formatCitation = (source: Source, style: string, page?: string): string => {
    switch (style) {
      case 'apa':
        return page ? `(${source.author}, ${source.year}, p. ${page})` : `(${source.author}, ${source.year})`;
      case 'mla':
        return page ? `(${source.author} ${page})` : `(${source.author})`;
      case 'chicago':
        return page ? `(${source.author} ${source.year}, ${page})` : `(${source.author} ${source.year})`;
      case 'harvard':
        return page ? `(${source.author}, ${source.year}, p. ${page})` : `(${source.author}, ${source.year})`;
      case 'ieee':
        return `[${source.id}]`;
      case 'vancouver':
        return `[${source.id}]`;
      default:
        return `(${source.author}, ${source.year})`;
    }
  };

  // Format bibliography entry
  const formatBibliographyEntry = (source: Source, style: string, index: number): string => {
    switch (style) {
      case 'apa':
        switch (source.type) {
          case 'book':
            return `${source.author}. (${source.year}). ${source.title}. ${source.publisher || 'Unknown Publisher'}.`;
          case 'journal':
            return `${source.author}. (${source.year}). ${source.title}. ${source.journal || 'Unknown Journal'}, ${source.volume || ''}${source.issue ? `(${source.issue})` : ''}, ${source.pages || 'n.p.'}.`;
          case 'website':
            return `${source.author}. (${source.year}). ${source.title}. Retrieved from ${source.url || 'Unknown URL'}`;
          default:
            return `${source.author}. (${source.year}). ${source.title}.`;
        }
      case 'mla':
        switch (source.type) {
          case 'book':
            return `${source.author}. "${source.title}." ${source.publisher || 'Unknown Publisher'}, ${source.year}.`;
          case 'journal':
            return `${source.author}. "${source.title}." ${source.journal || 'Unknown Journal'}, vol. ${source.volume || ''}, no. ${source.issue || ''}, ${source.year}, pp. ${source.pages || 'n.p.'}.`;
          case 'website':
            return `${source.author}. "${source.title}." ${source.url || 'Unknown URL'}, ${source.year}.`;
          default:
            return `${source.author}. "${source.title}." ${source.year}.`;
        }
      default:
        return `${source.author}. (${source.year}). ${source.title}.`;
    }
  };

  // Insert citation into editor
  const insertCitation = (sourceId: string, style: string, page?: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const citationText = formatCitation(source, style, page);
          const textNode = $createTextNode(citationText);
          selection.insertNodes([textNode]);

          // Add citation to tracking
          const newCitation: Citation = {
            id: Date.now().toString(),
            sourceId,
            style: style as any,
            position: citationCount,
            text: citationText,
            page
          };
          setCitations([...citations, newCitation]);
          setCitationCount(prev => prev + 1);
        }
      });
    }
  };

  // Insert bibliography
  const insertBibliography = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (sources.length === 0) {
            const textNode = $createTextNode('\n\nReferences\n\nNo sources added yet. Use the Reference dropdown to add sources.');
            selection.insertNodes([textNode]);
            return;
          }

          let bibliographyText = '\n\nReferences\n\n';
          
          sources.forEach((source, index) => {
            bibliographyText += formatBibliographyEntry(source, selectedStyle, index) + '\n';
          });

          const textNode = $createTextNode(bibliographyText);
          selection.insertNodes([textNode]);
        }
      });
    }
  };

  // Add new source
  const addSource = () => {
    if (!newSource.author || !newSource.title || !newSource.year) {
      alert('Please fill in at least Author, Title, and Year fields.');
      return;
    }

    const source: Source = {
      id: Date.now().toString(),
      type: newSource.type || 'book',
      author: newSource.author,
      title: newSource.title,
      year: newSource.year,
      publisher: newSource.publisher,
      journal: newSource.journal,
      volume: newSource.volume,
      issue: newSource.issue,
      pages: newSource.pages,
      url: newSource.url,
      doi: newSource.doi,
      isbn: newSource.isbn
    };

    setSources([...sources, source]);
    setShowSourceModal(false);
    resetNewSource();
  };

  // Update existing source
  const updateSource = () => {
    if (!editingSource) return;

    if (!newSource.author || !newSource.title || !newSource.year) {
      alert('Please fill in at least Author, Title, and Year fields.');
      return;
    }

    const updatedSource: Source = {
      ...editingSource,
      type: newSource.type || editingSource.type,
      author: newSource.author,
      title: newSource.title,
      year: newSource.year,
      publisher: newSource.publisher,
      journal: newSource.journal,
      volume: newSource.volume,
      issue: newSource.issue,
      pages: newSource.pages,
      url: newSource.url,
      doi: newSource.doi,
      isbn: newSource.isbn
    };

    setSources(sources.map(s => s.id === editingSource.id ? updatedSource : s));
    setShowSourceModal(false);
    setEditingSource(null);
    resetNewSource();
  };

  // Delete source
  const deleteSource = (sourceId: string) => {
    if (confirm('Are you sure you want to delete this source? This will also remove all citations referencing it.')) {
      setSources(sources.filter(s => s.id !== sourceId));
      setCitations(citations.filter(c => c.sourceId !== sourceId));
    }
  };

  // Reset new source form
  const resetNewSource = () => {
    setNewSource({
      type: 'book',
      author: '',
      title: '',
      year: new Date().getFullYear().toString(),
      publisher: '',
      journal: '',
      volume: '',
      issue: '',
      pages: '',
      url: '',
      doi: '',
      isbn: ''
    });
  };

  // Load source data for editing
  useEffect(() => {
    if (editingSource) {
      setNewSource({
        type: editingSource.type,
        author: editingSource.author,
        title: editingSource.title,
        year: editingSource.year,
        publisher: editingSource.publisher,
        journal: editingSource.journal,
        volume: editingSource.volume,
        issue: editingSource.issue,
        pages: editingSource.pages,
        url: editingSource.url,
        doi: editingSource.doi,
        isbn: editingSource.isbn
      });
    }
  }, [editingSource]);

  return (
    <>
      {/* Source Management Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingSource ? 'Edit Source' : 'Add New Source'}
                </h2>
                <button
                  onClick={() => {
                    setShowSourceModal(false);
                    setEditingSource(null);
                    resetNewSource();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Source Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source Type
                  </label>
                  <select
                    value={newSource.type}
                    onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="book">Book</option>
                    <option value="journal">Journal Article</option>
                    <option value="website">Website</option>
                    <option value="newspaper">Newspaper Article</option>
                    <option value="conference">Conference Paper</option>
                    <option value="thesis">Thesis/Dissertation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={newSource.author}
                      onChange={(e) => setNewSource({ ...newSource, author: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Author name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newSource.title}
                      onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year *
                    </label>
                    <input
                      type="text"
                      value={newSource.year}
                      onChange={(e) => setNewSource({ ...newSource, year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2024"
                    />
                  </div>

                  {/* Conditional fields based on source type */}
                  {newSource.type === 'book' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Publisher
                      </label>
                      <input
                        type="text"
                        value={newSource.publisher || ''}
                        onChange={(e) => setNewSource({ ...newSource, publisher: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Publisher"
                      />
                    </div>
                  )}

                  {newSource.type === 'journal' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Journal Name
                        </label>
                        <input
                          type="text"
                          value={newSource.journal || ''}
                          onChange={(e) => setNewSource({ ...newSource, journal: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Journal name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Volume
                        </label>
                        <input
                          type="text"
                          value={newSource.volume || ''}
                          onChange={(e) => setNewSource({ ...newSource, volume: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Volume number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Issue
                        </label>
                        <input
                          type="text"
                          value={newSource.issue || ''}
                          onChange={(e) => setNewSource({ ...newSource, issue: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Issue number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Pages
                        </label>
                        <input
                          type="text"
                          value={newSource.pages || ''}
                          onChange={(e) => setNewSource({ ...newSource, pages: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1-15"
                        />
                      </div>
                    </>
                  )}

                  {newSource.type === 'website' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL
                      </label>
                      <input
                        type="url"
                        value={newSource.url || ''}
                        onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => {
                      setShowSourceModal(false);
                      setEditingSource(null);
                      resetNewSource();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingSource ? updateSource : addSource}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingSource ? 'Update Source' : 'Add Source'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferencesManager;
