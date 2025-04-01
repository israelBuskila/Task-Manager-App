'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom } from '@/store/auth';
import { Center, Loader, Text } from '@mantine/core';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleBasedAccess({
  children,
  allowedRoles,
  fallbackPath = '/'
}: RoleBasedAccessProps) {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
      return;
    }

    // Check if user has the required role
    if (user && !allowedRoles.includes(user.role)) {
      router.push(fallbackPath);
    }
  }, [user, isAuthenticated, allowedRoles, fallbackPath, router]);

  if (!isAuthenticated) {
    return (
      <Center h={400}>
        <Text>Authentication required. Redirecting...</Text>
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Center h={400}>
        <Text>Unauthorized access. Redirecting...</Text>
      </Center>
    );
  }

  return <>{children}</>;
} 