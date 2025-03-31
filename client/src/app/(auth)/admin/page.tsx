'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Grid, 
  Paper, 
  Text, 
  Stack, 
  Group, 
  Tabs, 
  Badge,
  Avatar,
  Card,
  SimpleGrid,
  useMantineTheme,
  Loader,
  Center
} from '@mantine/core';
import { 
  IconUsers, 
  IconCheckbox, 
  IconAlertCircle, 
  IconClock,
  IconCalendarStats
} from '@tabler/icons-react';
import { TaskList } from '@/components/tasks/TaskList';
import { mockTasks } from '@/lib/mock/tasks';
import { Task, TaskStatus } from '@/types';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';

// Mock user data (replace with real API calls later)
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', tasksCount: 5 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', tasksCount: 3 },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', tasksCount: 8 },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'user', tasksCount: 2 },
];

export default function AdminDashboard() {
  const theme = useMantineTheme();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [loading, setLoading] = useState(false);
  
  // Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter(task => task.status === 'TODO').length;
  
  // Get tasks due soon (next 7 days)
  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);
  
  const tasksDueSoon = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= next7Days && task.status !== 'COMPLETED';
  });

  const statsData = [
    { title: 'Total Tasks', value: totalTasks, icon: IconCheckbox, color: 'blue' },
    { title: 'Completed', value: completedTasks, icon: IconCheckbox, color: 'green' },
    { title: 'In Progress', value: inProgressTasks, icon: IconClock, color: 'yellow' },
    { title: 'Pending', value: pendingTasks, icon: IconAlertCircle, color: 'orange' },
    { title: 'To Do', value: todoTasks, icon: IconAlertCircle, color: 'indigo' },
    { title: 'Users', value: mockUsers.length, icon: IconUsers, color: 'violet' },
  ];

  // In a real application, you would fetch this data from your API
  useEffect(() => {
    // Replace with actual API calls in a real implementation
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // setTasks(data from API);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={['admin']} fallbackPath="/(auth)/(dashboard)/user">
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Title>Admin Dashboard</Title>
          
          {/* Stats Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }}>
            {statsData.map((stat, index) => (
              <Card key={index} padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" style={{ textTransform: 'uppercase' }} fw={700}>
                      {stat.title}
                    </Text>
                    <Text fw={700} size="xl">
                      {stat.value}
                    </Text>
                  </div>
                  <stat.icon size={30} color={theme.colors[stat.color][6]} />
                </Group>
              </Card>
            ))}
          </SimpleGrid>
          
          {/* Tabs for different admin views */}
          <Tabs defaultValue="all-tasks">
            <Tabs.List>
              <Tabs.Tab value="all-tasks" leftSection={<IconCheckbox size={16} />}>
                All Tasks
              </Tabs.Tab>
              <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                Users
              </Tabs.Tab>
              <Tabs.Tab 
                value="urgent" 
                leftSection={<IconAlertCircle size={16} />}
                rightSection={
                  <Badge size="sm" variant="filled" color="red">
                    {tasksDueSoon.length}
                  </Badge>
                }
              >
                Due Soon
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="all-tasks" pt="md">
              <TaskList adminView={true} />
            </Tabs.Panel>

            <Tabs.Panel value="users" pt="md">
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                {mockUsers.map(user => (
                  <Card key={user.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Group>
                        <Avatar color="blue" radius="xl">{user.name.charAt(0)}</Avatar>
                        <div>
                          <Text fw={500}>{user.name}</Text>
                          <Text size="sm" c="dimmed">{user.email}</Text>
                        </div>
                      </Group>
                      <Badge color={user.role === 'admin' ? 'red' : 'blue'}>
                        {user.role}
                      </Badge>
                    </Group>
                    <Text mt="md">
                      <b>{user.tasksCount}</b> assigned tasks
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="urgent" pt="md">
              <Stack gap="md">
                {tasksDueSoon.length > 0 ? (
                  tasksDueSoon.map(task => (
                    <Card key={task.id} padding="md" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text fw={500}>{task.title}</Text>
                          <Text size="sm" c="dimmed">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Text>
                        </div>
                        <Badge color={
                          task.priority === 'HIGH' ? 'red' : 
                          task.priority === 'MEDIUM' ? 'yellow' : 'blue'
                        }>
                          {task.priority}
                        </Badge>
                      </Group>
                      <Text size="sm" mt="xs">{task.description}</Text>
                      <Group justify="space-between" mt="md">
                        <Badge>{task.status}</Badge>
                        <Text size="xs" c="dimmed">
                          Assigned to: {task.assignedTo || 'Unassigned'}
                        </Text>
                      </Group>
                    </Card>
                  ))
                ) : (
                  <Text c="dimmed" ta="center" py="xl">No tasks due soon</Text>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </RoleBasedAccess>
  );
}
