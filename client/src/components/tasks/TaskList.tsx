'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Container, Title, Stack, Button, Group, Text, Badge, Loader, Center, Alert } from '@mantine/core';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskFormModal } from './TaskFormModal';
import { Task, TaskFilters as TaskFiltersType, CreateTaskInput, UpdateTaskInput } from '@/types';
import { IconPlus, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { NotificationManager } from '@/lib/notification/notifications';
import { useAtom } from 'jotai';
import { tasksAtom, fetchTasksAtom, createTaskAtom, updateTaskAtom, deleteTaskAtom, isLoadingAtom, errorAtom, filteredTasksAtom, taskFiltersAtom } from '@/store/tasks';
import { userAtom } from '@/store/auth';
import { checkReminders } from '@/lib/notification/utils';

interface TaskListProps {
  adminView?: boolean;
}

export function TaskList({ adminView = false }: TaskListProps) {
  // Global state from Jotai
  const [tasks] = useAtom(tasksAtom);
  const [filteredTasks] = useAtom(filteredTasksAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const [error] = useAtom(errorAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);
  const [, createTask] = useAtom(createTaskAtom);
  const [, updateTask] = useAtom(updateTaskAtom);
  const [, deleteTask] = useAtom(deleteTaskAtom);
  const [user] = useAtom(userAtom);
  const [filters, setFilters] = useAtom(taskFiltersAtom);
  
  // Local component state
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isMounted = useRef(false);

  // Set up reminder checking
  useEffect(() => {
    // Check reminders immediately
    if (filteredTasks.length > 0) {
      checkReminders(filteredTasks);
    }

    // Set up interval to check reminders every minute
    const intervalId = setInterval(() => {
      if (filteredTasks.length > 0) {
        checkReminders(filteredTasks);
      }
    }, 60000); // Check every minute

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [filteredTasks]); // Re-run when filtered tasks change

  // Helper function to load tasks
  const loadTasks = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchTasks();
    } catch (error) {
      // Error handling is done in the atom
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTasks]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Load tasks on mount
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      loadTasks();
    }
  }, [loadTasks]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchTasks();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTasks]);

  // Handle task status changes
  const handleStatusChange = useCallback(async (taskId: string, newStatus: Task['status']) => {
    if (!taskId) {
      NotificationManager.showError('Cannot update task: Missing task ID');
      return;
    }
    
    try {
      await updateTask({ id: taskId, status: newStatus });
      NotificationManager.showTaskStatusChanged({ id: taskId, status: newStatus } as Task);
    } catch (error) {
      NotificationManager.showError('Failed to update task status');
    }
  }, [updateTask]);

  // Handle task deletion
  const handleTaskDelete = useCallback(async (taskId: string) => {
    if (!taskId) {
      NotificationManager.showError('Cannot delete task: Missing task ID');
      return;
    }
    
    // Find the task in the current list
    const taskToDelete = tasks.find(t => {
      const tId = t.id || t._id;
      return tId === taskId;
    });
    
    if (!taskToDelete) {
      NotificationManager.showError('Failed to delete task: Task not found');
      return;
    }
    
    try {
      const taskTitle = taskToDelete.title;
      
      await deleteTask(taskId);
      NotificationManager.showTaskDeleted(taskTitle);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      NotificationManager.showError(`Failed to delete task: ${errorMessage}`);
    }
  }, [deleteTask, tasks]);

  // Handle task editing
  const handleTaskEdit = (task: Task) => {
    const taskToEdit = {
      ...task,
      id: task.id || task._id
    };
    
    if (!taskToEdit.id) {
      NotificationManager.showError('Failed to edit task: Missing task ID');
      return;
    }
    
    setEditingTask(taskToEdit);
    setModalOpened(true);
  };

  // Handle task creation
  const handleCreateTask = useCallback(() => {
    setEditingTask(undefined);
    setModalOpened(true);
  }, []);
  
  // Handle task form submission
  const handleTaskSubmit = useCallback(async (formData: CreateTaskInput | UpdateTaskInput) => {
    try {
      // Check if this is an update (has an id property)
      if ('id' in formData && formData.id) {
        const updatedTask = await updateTask(formData);
        NotificationManager.showTaskUpdated(updatedTask);
      } else {
        // For regular users, always assign new tasks to themselves
        if (!adminView && user) {
          (formData as CreateTaskInput).assignedTo = user.id;
        }
        
        // Create new task
        await createTask(formData as CreateTaskInput);
        NotificationManager.showSuccess('Task created successfully');
      }
      
      setModalOpened(false);
      setEditingTask(undefined);
    } catch (error) {
      NotificationManager.showError('Failed to save task');
    }
  }, [adminView, createTask, updateTask, user]);

  // Show loading state
  if (isLoading && tasks.length === 0) {
    return (
      <Center h={200}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed" size="sm">Loading tasks...</Text>
        </Stack>
      </Center>
    );
  }

  // Show error state
  if (error && tasks.length === 0) {
    return (
      <Alert 
        icon={<IconAlertCircle size={16} />} 
        title="Error loading tasks" 
        color="red"
        variant="filled"
      >
        {error}
      </Alert>
    );
  }

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={2}>
            {adminView ? 'All Tasks' : 'My Assigned Tasks'}
            {adminView && (
              <Badge size="sm" ml="xs">
                Admin View
              </Badge>
            )}
          </Title>
          <Group>
            <Button 
              variant="light"
              color="blue"
              onClick={handleRefresh}
              disabled={isRefreshing}
              leftSection={<IconRefresh size={16} />}
              size="sm"
            >
              Refresh
            </Button>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateTask}
            >
              New Task
            </Button>
          </Group>
        </Group>
        <TaskFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          adminMode={adminView} 
        />
        
        {(isLoading || isRefreshing) && (
          <Center py="sm">
            <Loader size="sm" />
          </Center>
        )}
        
        <Stack gap="md">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id || task._id}
                task={task}
                onEdit={handleTaskEdit}
                onStatusChange={handleStatusChange}
                onDelete={handleTaskDelete}
                showUser={adminView}
              />
            ))
          ) : (
            <Text c="dimmed" ta="center" py="xl">No tasks found matching your filters</Text>
          )}
        </Stack>
        
        <TaskFormModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          task={editingTask}
          onSubmit={handleTaskSubmit}
          adminMode={adminView}
        />
      </Stack>
    </Container>
  );
}