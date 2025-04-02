'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
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
  Center,
  Select,
  Button,
  ActionIcon
} from '@mantine/core';
import { 
  IconUsers, 
  IconCheckbox, 
  IconAlertCircle, 
  IconClock,
  IconTrash,
  IconFileAnalytics
} from '@tabler/icons-react';
import { TaskList } from '@/components/tasks/TaskList';
import { useAtom } from 'jotai';
import { tasksAtom, fetchTasksAtom, isLoadingAtom as tasksLoadingAtom, updateTaskAtom, deleteTaskAtom } from '@/store/tasks';
import { adminApi } from '@/lib/api/admin.api';
import { NotificationManager } from '@/lib/notification/notifications';

// User type for admin dashboard
interface UserWithTaskCount {
  id: string;
  name: string;
  email: string;
  role: string;
  tasksCount: number;
}

export default function AdminDashboard() {
  const theme = useMantineTheme();
  const [tasks] = useAtom(tasksAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);
  const [, updateTask] = useAtom(updateTaskAtom);
  const [, deleteTask] = useAtom(deleteTaskAtom);
  const [isTasksLoading] = useAtom(tasksLoadingAtom);
  
  // Use state for users but initialize with mock data
  const [users, setUsers] = useState<UserWithTaskCount[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  
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

  // Handle task assignment
  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId || t._id === taskId);
      if (!taskToUpdate) return;
      
      // Only include properties that are part of UpdateTaskInput
      await updateTask({
        id: taskId,
        assignedTo: userId
      });
      
      NotificationManager.showSuccess('Task assigned successfully');
    } catch (error) {
      console.error('Error assigning task:', error);
      NotificationManager.showError('Failed to assign task');
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      NotificationManager.showSuccess('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      NotificationManager.showError('Failed to delete task');
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      // Fetch tasks from atom
      fetchTasks();
      
      // Try to fetch users from API first, fallback to mock data if it fails
      setIsUsersLoading(true);
      try {
        // Use the admin API to get users with task count
        const response = await adminApi.getUsersWithTaskCount();
        if (response.success && response.data) {
          // Transform data to match our expected format
          const usersWithTaskCount = response.data.map(user => {
            return {
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
              tasksCount: user.tasksCount || 0
            };
          });
          setUsers(usersWithTaskCount);
          setError(null);
        } else {
          throw new Error(response.error || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Could not connect to server, using mock data');
      } finally {
        setIsUsersLoading(false);
      }
    };
    
    fetchData();
  }, [fetchTasks]);

  // Update task counts separately when tasks or users change
  useEffect(() => {
    if (users.length > 0 && tasks.length > 0) {
      const updatedUsers = users.map(user => ({
        ...user,
        tasksCount: tasks.filter(task => task.userId === user.id).length
      }));
      setUsers(updatedUsers);
    }
  }, [tasks]);

  // Stats data for dashboard
  const statsData = [
    { title: 'Total Tasks', value: totalTasks, icon: IconCheckbox, color: 'blue' },
    { title: 'Completed', value: completedTasks, icon: IconCheckbox, color: 'green' },
    { title: 'In Progress', value: inProgressTasks, icon: IconClock, color: 'yellow' },
    { title: 'Pending', value: pendingTasks, icon: IconAlertCircle, color: 'orange' },
    { title: 'To Do', value: todoTasks, icon: IconAlertCircle, color: 'indigo' },
    { title: 'Users', value: users.length, icon: IconUsers, color: 'violet' },
  ];

  if (isTasksLoading || isUsersLoading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
      <Container size="xl" py="xl">
        <Stack gap="xl">
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
                All Tasks ({tasks.length})
              </Tabs.Tab>
              <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                Users ({users.length})
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
              <Tabs.Tab value="analytics" leftSection={<IconFileAnalytics size={16} />}>
                Analytics
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="all-tasks" pt="md">
              <TaskList adminView={true} />
            </Tabs.Panel>

            <Tabs.Panel value="users" pt="md">
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                {users.map(user => (
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
                    <Group justify="apart" mt="md">
                      <Text>
                        <b>{user.tasksCount}</b> assigned tasks
                      </Text>
                      <Button 
                        variant="subtle" 
                        size="xs"
                        onClick={() => {
                          // Switch to all tasks tab using a different approach
                          const allTasksTab = document.querySelector('[data-value="all-tasks"]') as HTMLElement;
                          if (allTasksTab) allTasksTab.click();
                        }}
                      >
                        View Tasks
                      </Button>
                    </Group>
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
                        <Group>
                          <Badge>{task.status}</Badge>
                          <Text size="xs" c="dimmed">
                            Assigned to: {task.user ? `${task.user.firstName} ${task.user.lastName}` : 'Unassigned'}
                          </Text>
                        </Group>
                        <Group>
                          <Select
                            placeholder="Reassign"
                            data={users.map(user => ({
                              value: user.id,
                              label: user.name
                            }))}
                            value={task.userId || ''}
                            onChange={(value) => value && handleAssignTask(task.id || task._id || '', value)}
                            size="xs"
                            w={150}
                          />
                          <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteTask(task.id || task._id || '')}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  ))
                ) : (
                  <Text c="dimmed" ta="center" py="xl">No tasks due soon</Text>
                )}
              </Stack>
            </Tabs.Panel>
            
            <Tabs.Panel value="analytics" pt="md">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Card padding="lg" radius="md" withBorder>
                  <Title order={3} mb="md">Task Status Distribution</Title>
                  <Group justify="apart" mb="xs">
                    <Text>Completed</Text>
                    <Text>{Math.round((completedTasks / totalTasks) * 100)}%</Text>
                  </Group>
                  <Paper 
                    style={{
                      height: '10px', 
                      width: `${(completedTasks / totalTasks) * 100}%`,
                      backgroundColor: theme.colors.green[6],
                      borderRadius: theme.radius.sm
                    }} 
                    mb="md"
                  />
                  
                  <Group justify="apart" mb="xs">
                    <Text>In Progress</Text>
                    <Text>{Math.round((inProgressTasks / totalTasks) * 100)}%</Text>
                  </Group>
                  <Paper 
                    style={{
                      height: '10px', 
                      width: `${(inProgressTasks / totalTasks) * 100}%`,
                      backgroundColor: theme.colors.yellow[6],
                      borderRadius: theme.radius.sm
                    }} 
                    mb="md"
                  />
                  
                  <Group justify="apart" mb="xs">
                    <Text>Pending</Text>
                    <Text>{Math.round((pendingTasks / totalTasks) * 100)}%</Text>
                  </Group>
                  <Paper 
                    style={{
                      height: '10px', 
                      width: `${(pendingTasks / totalTasks) * 100}%`,
                      backgroundColor: theme.colors.orange[6],
                      borderRadius: theme.radius.sm
                    }} 
                    mb="md"
                  />
                  
                  <Group justify="apart" mb="xs">
                    <Text>To Do</Text>
                    <Text>{Math.round((todoTasks / totalTasks) * 100)}%</Text>
                  </Group>
                  <Paper 
                    style={{
                      height: '10px', 
                      width: `${(todoTasks / totalTasks) * 100}%`,
                      backgroundColor: theme.colors.indigo[6],
                      borderRadius: theme.radius.sm
                    }} 
                  />
                </Card>
                
                <Card padding="lg" radius="md" withBorder>
                  <Title order={3} mb="md">Task Assignment</Title>
                  {users.map(user => (
                    <div key={user.id}>
                      <Group justify="apart" mb="xs">
                        <Text>{user.name}</Text>
                        <Text>{user.tasksCount} tasks</Text>
                      </Group>
                      <Paper 
                        style={{
                          height: '10px', 
                          width: `${(user.tasksCount / totalTasks) * 100}%`,
                          backgroundColor: user.role === 'admin' ? theme.colors.red[6] : theme.colors.blue[6],
                          borderRadius: theme.radius.sm
                        }} 
                        mb="md"
                      />
                    </div>
                  ))}
                </Card>
              </SimpleGrid>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
  );
}
