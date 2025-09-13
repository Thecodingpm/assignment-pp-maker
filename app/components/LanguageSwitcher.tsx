'use client';

import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const [dir, setDir] = useState<'ltr' | 'rtl' | 'auto'>('auto');
  const [lang, setLang] = useState<'default' | 'ur' | 'ar' | 'fa' | 'he' | 'hi' | 'fr' | 'es'>('default');

  useEffect(() => {
    const el = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
    if (!el) return;
    const rtlLangs = new Set(['ur', 'ar', 'fa', 'he', 'ps']);
    const effectiveDir = dir === 'auto' ? (rtlLangs.has(lang) ? 'rtl' : 'ltr') : dir;
    // Apply language
    if (lang !== 'default') {
      el.setAttribute('data-lang', lang);
      el.setAttribute('lang', lang);
    } else {
      el.removeAttribute('data-lang');
      el.removeAttribute('lang');
    }
    // Apply direction
    el.setAttribute('dir', effectiveDir);
    el.setAttribute('data-dir', effectiveDir);
  }, [dir, lang]);

  return (
    <div className="flex items-center gap-2 bg-white/85 dark:bg-gray-800/85 border border-gray-200/70 dark:border-gray-700/70 rounded-lg px-3 py-1.5 shadow-md">
      <button
        onClick={() => {
          setDir('rtl');
        }}
        className={`px-2.5 py-1 rounded text-xs font-medium ${dir === 'rtl' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        title="Right-to-left"
        aria-label="Right-to-left"
      >RTL</button>
      <button
        onClick={() => {
          setDir('ltr');
        }}
        className={`px-2.5 py-1 rounded text-xs font-medium ${dir === 'ltr' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        title="Left-to-right"
        aria-label="Left-to-right"
      >LTR</button>
      <button
        onClick={() => setDir('auto')}
        className={`px-2.5 py-1 rounded text-xs font-medium ${dir === 'auto' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        title="Auto direction"
        aria-label="Auto direction"
      >Auto</button>
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as any)}
        className="px-2 h-7 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-xs focus:outline-none"
        title="Language"
      >
        <option value="default">English</option>
        <option value="ur">Urdu</option>
        <option value="ar">Arabic</option>
        <option value="fa">Persian (Farsi)</option>
        <option value="he">Hebrew</option>
        <option value="hi">Hindi</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
      </select>
    </div>
  );
}

