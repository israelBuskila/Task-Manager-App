// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import AuthProvider from '@/components/layout/AuthProvider';
import JotaiProvider from '@/components/layout/JotaiProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Management App',
  description: 'A modern task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={inter.className}>
        <JotaiProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}