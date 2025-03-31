'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom } from '@/store/auth';
import { Center, Loader, Text } from '@mantine/core';

export default function Home() {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  useEffect(() => {
    // If authentication state is known
    if (isAuthenticated === true) {
      // Redirect to the appropriate dashboard based on user role
      if (user?.role === 'admin') {
        router.push('/(auth)/(dashboard)/admin');
      } else {
        router.push('/(auth)/(dashboard)/user');
      }
    } else if (isAuthenticated === false) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
    // If isAuthenticated is undefined, we're still loading - show the loader below
  }, [isAuthenticated, user, router]);

  return (
    <Center h="100vh">
      <div style={{ textAlign: 'center' }}>
        <Loader size="xl" />
        <Text mt="md">Redirecting to the appropriate dashboard...</Text>
      </div>
    </Center>
  );
} 