'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Stack,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { LoginCredentials } from '@/types';
import { loginAtom, errorAtom, isLoadingAtom, userAtom } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const [, login] = useAtom(loginAtom);
  const [error] = useAtom(errorAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const [user] = useAtom(userAtom);

  // Check if user is already logged in and redirect if needed
  useEffect(() => {
    console.log('User:', user);
    if (user) {
      if (user.role === 'admin') {
        router.push('/adminDashboard');
      } else {
        router.push('/userDashboard');
      }
    }
  }, [user, router]);

  const form = useForm<LoginCredentials>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      console.log('Login attempt:', values);
      
      // Perform login
      const userData = await login(values);
      console.log('Login successful, redirecting...', userData);
      
      // Check user role and redirect accordingly
      if (userData?.role === 'admin') {
        router.push('/adminDashboard');
      } else {
        router.push('/userDashboard');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the atom
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account yet?{' '}
        <Link href="/register" style={{ color: 'var(--mantine-color-blue-filled)' }}>
          Create account
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                {error}
              </Alert>
            )}

            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...form.getInputProps('password')}
            />

            <Button type="submit" fullWidth mt="xl" loading={isLoading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
