'use client';

import { TaskList } from '@/components/tasks/TaskList';
import { Container, Title, Text } from '@mantine/core';

export default function UserDashboard() {

  return (
      <Container size="xl" py="xl">

        <TaskList />
      </Container>
  );
}