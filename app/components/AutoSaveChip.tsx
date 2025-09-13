'use client';

import React from 'react';

type AutoState = 'idle' | 'saving' | 'saved' | 'error';

export default function AutoSaveChip({ state }: { state: AutoState }) {
  const base = 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm transition-all select-none shadow-sm';
  const theme =
    state === 'saving'
      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-700/50'
      : state === 'saved'
      ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-300 ring-1 ring-inset ring-green-200/70 dark:ring-green-700/50'
      : state === 'error'
      ? 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 dark:from-rose-900/20 dark:to-rose-800/20 dark:text-rose-300 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-700/50'
      : 'bg-white/90 text-gray-600 dark:bg-gray-800/80 dark:text-gray-300 ring-1 ring-inset ring-gray-200/80 dark:ring-gray-700/60';

  return (
    <div className={`${base} ${theme}`} aria-live="polite" aria-atomic="true" style={{ minWidth: 120, transform: 'translateX(-8px)' }}>
      {/* Cloud icon with subtle animation */}
      <span className="relative inline-flex items-center justify-center w-5 h-5">
        {/* Cloud */}
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
          <path
            d="M7 18a4 4 0 010-8c.24 0 .47.02.7.07A5 5 0 0117 9a3 3 0 010 6H7z"
            fill="currentColor"
            opacity={state === 'saving' ? 0.9 : 1}
          />
        </svg>
        {/* Spinner ring when saving */}
        {state === 'saving' && (
          <span className="absolute inset-0 animate-spin" style={{ animationDuration: '900ms' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="60" strokeDashoffset="40" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {/* Error cross */}
        {state === 'error' && (
          <span className="absolute inset-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-rose-500" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {/* Check mark when saved */}
        {state === 'saved' && (
          <span className="absolute -right-1 -bottom-1 text-green-500">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden>
              <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </span>
      <span>{state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : state === 'error' ? 'Retry' : 'Autosave'}</span>
    </div>
  );
}

