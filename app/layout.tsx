import './globals.css';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

/**
 * Root layout for the application. It provides global styling, registers the
 * service worker for PWA functionality and implements a simple dark/light
 * theme toggler. All pages are rendered within the <main> element.
 */
export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialise theme from localStorage on first mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
  }, []);

  // Apply theme class to html element and persist to localStorage whenever it changes.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Register the service worker once on mount.
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration might fail in dev; silently ignore.
      });
    }
  }, []);

  return (
    <html lang="nb">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* theme-color hints the browser about the color of the status bar */}
        <meta name="theme-color" content={theme === 'dark' ? '#1f2937' : '#ffffff'} />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
          <h1 className="font-bold text-xl">Månedsavslutt</h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
          >
            {theme === 'dark' ? 'Lys modus' : 'Mørk modus'}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
        <footer className="text-center text-xs py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Kaffebar
        </footer>
      </body>
    </html>
  );
}