'use client';

import { useState } from 'react';
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
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { RegisterCredentials } from '@/types';
import { registerAtom, errorAtom, isLoadingAtom } from '@/store/auth';
import { NotificationManager } from '@/lib/notification/notifications';

export default function RegisterPage() {
  const router = useRouter();
  const [, register] = useAtom(registerAtom);
  const [error] = useAtom(errorAtom);
  const [isLoading] = useAtom(isLoadingAtom);

  const form = useForm<RegisterCredentials>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    validate: {
      firstName: (value) => (value.trim().length < 2 ? 'First name must be at least 2 characters' : null),
      lastName: (value) => (value.trim().length < 2 ? 'Last name must be at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: RegisterCredentials) => {
    try {
      await register(values);
      
      // For demo purposes, just show success notification and redirect
      NotificationManager.showSuccess('Registration successful! You can now login.');
      router.push('/login');
    } catch (err) {
      // Error is handled by the atom
    }
  };

  return (
    <Container size={520} my={40}>
      <Title ta="center" fw={900}>
        Create a new account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--mantine-color-blue-filled)' }}>
          Sign in
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

            <Group grow>
              <TextInput
                label="First Name"
                placeholder="Your first name"
                required
                {...form.getInputProps('firstName')}
              />

              <TextInput
                label="Last Name"
                placeholder="Your last name"
                required
                {...form.getInputProps('lastName')}
              />
            </Group>

            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              description="Password must be at least 6 characters"
              required
              {...form.getInputProps('password')}
            />

            <Button type="submit" fullWidth mt="xl" loading={isLoading}>
              Create account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
