'use client';

import { useState, useEffect } from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { Header } from '@/components/layout/Header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load color scheme from localStorage on mount
  useEffect(() => {
    const savedColorScheme = localStorage.getItem('mantine-color-scheme') as 'light' | 'dark' | null;
    if (savedColorScheme) {
      setColorScheme(savedColorScheme);
    }
  }, []);

  return (
    <MantineProvider
      defaultColorScheme="light"
      {...(mounted ? { colorScheme } : {})}
    >
      <Notifications position="top-right" zIndex={2000} />
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <main style={{ padding: '1rem' }}>
          {children}
        </main>
      </div>
    </MantineProvider>
  );
} 