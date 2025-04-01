'use client';

import { Provider } from 'jotai';
import { ReactNode } from 'react';

interface JotaiProviderProps {
  children: ReactNode;
}

// Create a single Jotai provider to prevent the "multiple instances" warning
export default function JotaiProvider({ children }: JotaiProviderProps) {
  return <Provider>{children}</Provider>;
} 