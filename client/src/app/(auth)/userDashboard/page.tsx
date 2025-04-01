'use client';

import { useEffect } from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';
import { Container, Title, Text } from '@mantine/core';
import { useAtom } from 'jotai';
import { fetchTasksAtom } from '@/store/tasks';

export default function UserDashboard() {
  const [, fetchTasks] = useAtom(fetchTasksAtom);
  
  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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