'use client';

import { TaskList } from '@/components/tasks/TaskList';
import { Container, Title, Text } from '@mantine/core';

export default function UserDashboard() {

  return (
      <Container size="xl" py="xl">
        <Title mb="lg">My Tasks</Title>
        <Text mb="md" c="dimmed">Manage your personal tasks</Text>
        <TaskList />
      </Container>
  );
}