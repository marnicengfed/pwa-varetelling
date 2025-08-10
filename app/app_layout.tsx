import './globals.css';
import type { ReactNode } from 'react';
import ClientShell from '../components/ClientShell';

export const metadata = {
  title: 'Månedsavslutt Kaffebar',
  description: 'PWA for varetelling og månedsavslutt',
  themeColor: '#1f2937'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 min-h-screen">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
