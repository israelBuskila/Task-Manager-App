'use client';

import { Provider } from 'jotai';
import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { loadUserAtom } from '@/store/auth';

interface JotaiProviderProps {
  children: ReactNode;
}

function StateInitializer() {
  const [, loadUser] = useAtom(loadUserAtom);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return null;
}

// Create a single Jotai provider to prevent the "multiple instances" warning
export default function JotaiProvider({ children }: JotaiProviderProps) {
  return (
    <Provider>
      <StateInitializer />
      {children}
    </Provider>
  );
} 