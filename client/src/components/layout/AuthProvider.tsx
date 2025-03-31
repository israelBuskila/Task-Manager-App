'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { loadUserAtom } from '@/store/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [, loadUser] = useAtom(loadUserAtom);

  useEffect(() => {
    // Load user data if a token exists
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
} 