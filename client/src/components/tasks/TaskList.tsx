'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Title, Stack, Button, Group, Text, Badge, Loader, Center, Alert } from '@mantine/core';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskFormModal } from './TaskFormModal';
import { Task, TaskFilters as TaskFiltersType, CreateTaskInput, UpdateTaskInput } from '@/types';
import { IconPlus, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { NotificationManager } from '@/lib/notifications';
import { useAtom } from 'jotai';
import { tasksAtom, fetchTasksAtom, createTaskAtom, updateTaskAtom, deleteTaskAtom, isLoadingAtom, errorAtom } from '@/store/tasks';
import { userAtom } from '@/store/auth';

interface TaskListProps {
  adminView?: boolean;
}

export function TaskList({ adminView = false }: TaskListProps) {
  // Global state from Jotai
  const [tasks] = useAtom(tasksAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const [error] = useAtom(errorAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);
  const [, createTask] = useAtom(createTaskAtom);
  const [, updateTask] = useAtom(updateTaskAtom);
  const [, deleteTask] = useAtom(deleteTaskAtom);
  const [user] = useAtom(userAtom);
  
  // Local component state
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isMounted = useRef(false);

  // Helper function to load tasks with proper filtering
  const loadTasks = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // If not in admin view, only show tasks assigned to the current user
      if (!adminView && user) {
        const taskFilters: TaskFiltersType = { ...filters };
        
        // Always filter by assignedTo for regular users
        taskFilters.assignedTo = user.id;
        
        await fetchTasks(taskFilters);
      } else {
        // Admin view - fetch all tasks with the current filters
        await fetchTasks(filters);
      }
    } catch (error) {
      // Error handling is done in the atom
    } finally {
      setIsRefreshing(false);
    }
  }, [adminView, fetchTasks, filters, user]);

  // Fetch tasks on mount with retry logic
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      loadTasks();
      return;
    }
    
    // This runs when retryCount changes (not on initial mount)
    if (retryCount > 0) {
      loadTasks();
    }
  }, [loadTasks, retryCount]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  // Check for tasks due soon (for notifications)
  useEffect(() => {
    if (tasks.length === 0) return;
    
    const today = new Date();
    
    // Check for tasks due in 2 days
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);
    
    tasks.forEach(task => {
      if (task.status === 'COMPLETED') return;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      // If task is due in exactly 2 days, show notification
      if (dueDate.getTime() === twoDaysFromNow.getTime()) {
        NotificationManager.showTaskDueSoon(task, 2);
      }
    });
  }, [tasks]);

  // Handle task status changes
  const handleStatusChange = useCallback(async (taskId: string, status: Task['status']) => {
    const taskToUpdate = tasks.find(task => task.id === taskId || task._id === taskId);
    if (!taskToUpdate) return;
    
    try {
      await updateTask({
        id: taskId,
        status
      });
      NotificationManager.showTaskStatusChanged({...taskToUpdate, status});
    } catch (error) {
      NotificationManager.showError('Failed to update task status');
    }
  }, [tasks, updateTask]);

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
  const handleTaskEdit = useCallback((task: Task) => {
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
  }, []);

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
        
        NotificationManager.showTaskUpdated({
          ...(editingTask as Task), 
          ...formData
        });
      } else {
        // For regular users, always assign new tasks to themselves
        if (!adminView && user) {
          (formData as CreateTaskInput).assignedTo = user.id;
        }
        
        // Create new task
        const createdTask = await createTask(formData as CreateTaskInput);
        NotificationManager.showSuccess('Task created successfully');
      }
      
      setModalOpened(false);
      setEditingTask(undefined);
      
      // Refresh tasks to ensure we have the latest data
      loadTasks();
    } catch (error) {
      NotificationManager.showError('Failed to save task');
    }
  }, [adminView, createTask, editingTask, loadTasks, updateTask, user]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: TaskFiltersType) => {
    setFilters(newFilters);
    // When filters change, we should refresh the tasks
    setTimeout(() => loadTasks(), 100);
  }, [loadTasks]);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Apply client-side filters if needed
  const filteredTasks = tasks.filter(task => {
    // Apply filters from the filter component
    if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }
    
    // Filter by users (for admin view)
    if (filters.users && filters.users.length > 0) {
      // Get task user ID from either userId or user._id
      const taskUserId = task.userId || task.user?._id;
      if (!taskUserId || !filters.users.includes(taskUserId)) {
        return false;
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
        <Button
          variant="white"
          color="red"
          size="xs"
          mt="sm"
          onClick={handleRetry}
        >
          Retry Loading
        </Button>
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