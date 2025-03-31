'use client';

import { TaskList } from '@/components/tasks/TaskList';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';
import { Container, Title, Text } from '@mantine/core';

export default function UserDashboardPage() {
  return (
    <RoleBasedAccess allowedRoles={['user', 'admin']} fallbackPath="/login">
      <Container size="xl" py="xl">
        <Title mb="lg">My Tasks</Title>
        <Text mb="md" c="dimmed">Manage your personal tasks</Text>
        <TaskList />
      </Container>
    </RoleBasedAccess>
  );
}