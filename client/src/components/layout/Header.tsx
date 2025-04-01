'use client';

import { useState, useEffect } from 'react';
import { Group, Title, ActionIcon, Button, Box, Badge, Menu, Text } from '@mantine/core';
import { IconSun, IconMoon, IconBell, IconLogout, IconUser, IconDashboard, IconSettings } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationManager } from '@/lib/notifications';
import { useAtom } from 'jotai';
import { userAtom, logoutAtom } from '@/store/auth';
import Link from 'next/link';

export function Header() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const [user] = useAtom(userAtom);
  const [, logout] = useAtom(logoutAtom);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to true on client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't show header on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage && !mounted) return null;
  
  const toggleColorScheme = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newColorScheme);
    localStorage.setItem('mantine-color-scheme', newColorScheme);
  };
  
  const handleLogout = async () => {
    await logout();
    NotificationManager.showLogout();
    
    // Redirect to login page
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };
  
  const handleTestReminder = () => {
    NotificationManager.showTestReminder();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Box
      py="md"
      px="xl"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <Group justify="space-between">
        <Group>
          <Title order={3}>Task Management</Title>
          {user && (
            <Badge color={isAdmin ? 'red' : 'blue'} variant="filled">
              {isAdmin ? 'Admin' : 'User'}
            </Badge>
          )}
        </Group>
        
        <Group>
          {user && (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button 
                  leftSection={<IconUser size={16} />}
                  variant="subtle"
                  size="sm"
                >
                  {user.firstName} {user.lastName}
                </Button>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Label>Navigation</Menu.Label>
                <Link href="/userDashboard" style={{ textDecoration: 'none' }}>
                  <Menu.Item leftSection={<IconDashboard size={14} />}>
                    My Dashboard
                  </Menu.Item>
                </Link>
                
                {isAdmin && (
                  <Link href="/adminDashboard" style={{ textDecoration: 'none' }}>
                    <Menu.Item leftSection={<IconSettings size={14} />}>
                      Admin Dashboard
                    </Menu.Item>
                  </Link>
                )}
                
                <Menu.Divider />
                
                <Menu.Item 
                  leftSection={<IconLogout size={14} />} 
                  color="red"
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          
          <Button 
            leftSection={<IconBell size={16} />}
            onClick={handleTestReminder}
            variant="subtle"
            size="sm"
          >
            Test Reminder
          </Button>
          
          <ActionIcon
            onClick={toggleColorScheme}
            variant="default"
            size="lg"
            radius="xl"
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
        </Group>
      </Group>
    </Box>
  );
} 