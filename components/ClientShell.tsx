"use client";
import { ReactNode, useEffect, useState } from 'react';

export default function ClientShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <h1 className="font-semibold">Månedsavslutt</h1>
          <button
            className="text-sm px-3 py-1 rounded-md border"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label="Bytt tema"
          >
            {theme === 'dark' ? 'Lys modus' : 'Mørk modus'}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>
    </>
  );
}
