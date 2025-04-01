'use client';

import { useState, useEffect, useRef } from 'react';
import { Container, Title, Stack, Button, Group, Text, Badge, Loader, Center, Alert } from '@mantine/core';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskFormModal } from './TaskFormModal';
import { Task, TaskFilters as TaskFiltersType, CreateTaskInput, UpdateTaskInput } from '@/types';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { NotificationManager } from '@/lib/notifications';
import { useAtom } from 'jotai';
import { tasksAtom, fetchTasksAtom, createTaskAtom, updateTaskAtom, deleteTaskAtom, isLoadingAtom, errorAtom, lastFetchTimeAtom } from '@/store/tasks';
import { userAtom } from '@/store/auth';
import { adminApi } from '@/lib/api/client';

interface TaskListProps {
  adminView?: boolean;
}

export function TaskList({ adminView = false }: TaskListProps) {
  const [tasks] = useAtom(tasksAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const [error] = useAtom(errorAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);
  const [, createTask] = useAtom(createTaskAtom);
  const [, updateTask] = useAtom(updateTaskAtom);
  const [, deleteTask] = useAtom(deleteTaskAtom);
  const [lastFetchTime, setLastFetchTime] = useAtom(lastFetchTimeAtom);
  const [user] = useAtom(userAtom);
  
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  
  // State to track view mode (created by me or assigned to me)
  const [viewMode, setViewMode] = useState<'created' | 'assigned' | 'all'>('all');
  
  // State for task management
  const [optimisticTasks, setOptimisticTasks] = useState<Task[] | null>(null);
  
  const isMounted = useRef(false);

  // Fetch tasks on mount with retry logic
  useEffect(() => {
    // Skip initial render dependency changes when component mounts
    if (!isMounted.current) {
      isMounted.current = true;
      
      const loadTasks = async () => {
        try {
          console.log('Fetching tasks on initial mount');
          await fetchTasks();
        } catch (error) {
          console.error('Error fetching tasks:', error);
          
          // Auto-retry up to 3 times with increasing delay
          if (retryCount < 3) {
            const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, delay);
          }
        }
      };
      
      loadTasks();
      return;
    }
    
    // This runs when retryCount changes (not on initial mount)
    if (retryCount > 0) {
      const loadTasks = async () => {
        try {
          console.log(`Retrying fetch (#${retryCount})`);
          await fetchTasks();
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
      
      loadTasks();
    }
  }, [fetchTasks, retryCount]);

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

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;
    
    try {
      await updateTask({
        id: taskId,
        status
      });
      NotificationManager.showTaskStatusChanged({...taskToUpdate, status});
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!taskId) {
      console.error('Invalid task ID received for deletion:', taskId);
      NotificationManager.showError('Cannot delete task: Missing task ID');
      return;
    }
    
    console.log('Attempting to delete task with ID:', taskId);
    
    // Find the task in the current list
    const taskToDelete = tasks.find(t => {
      const tId = t.id || t._id;
      const matches = tId === taskId;
      if (matches) {
        console.log('Found task to delete:', t);
      }
      return matches;
    });
    
    if (!taskToDelete) {
      console.error('Could not find task to delete with ID:', taskId, 
        'Available tasks:', tasks.map(t => ({ id: t.id, _id: t._id })));
      NotificationManager.showError('Failed to delete task: Task not found');
      return;
    }
    
    try {
      const taskTitle = taskToDelete.title;
      console.log('Deleting task:', taskToDelete);
      
      // Show optimistic UI update - remove the task immediately
      const optimisticTasks = tasks.filter(t => (t.id || t._id) !== taskId);
      setOptimisticTasks(optimisticTasks);
      
      // Now call the API to actually delete it
      await deleteTask(taskId);
      NotificationManager.showTaskDeleted(taskTitle);
      
      // Clear optimistic state
      setOptimisticTasks(null);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticTasks(null);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting task:', error);
      
      // Handle specific error cases
      if (errorMessage.includes('Task not found')) {
        // The task might have been deleted already, so we can remove it from our list
        NotificationManager.showInfo('This task may have been already deleted');
        
        // Force refresh the task list
        setTimeout(() => {
          console.log('Refreshing task list after failed deletion');
          fetchTasks();
        }, 500);
      } else {
        // For other errors, show generic message
        NotificationManager.showError(`Failed to delete task: ${errorMessage}`);
      }
    }
  };

  const handleTaskEdit = (task: Task) => {
    console.log('Editing task:', task);
    
    // MongoDB objects might have _id instead of id
    const taskToEdit = {
      ...task,
      // Ensure we have the id property, preferring task.id if it exists, otherwise use _id
      id: task.id || task._id
    };
    
    // Make sure we have a task ID
    if (!taskToEdit.id) {
      console.error('Cannot edit task: Missing task ID', task);
      NotificationManager.showError('Failed to edit task: Missing task ID');
      return;
    }
    
    console.log('Prepared task for editing:', taskToEdit);
    setEditingTask(taskToEdit);
    setModalOpened(true);
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setModalOpened(true);
  };
  
  const handleTaskSubmit = async (formData: CreateTaskInput | UpdateTaskInput) => {
    try {
      // Check if this is an update (has an id property)
      if ('id' in formData && formData.id) {
        console.log('Updating task with ID:', formData.id);
        console.log('Update data:', formData);
        
        // Note: Task creator (userId) cannot be changed after creation, even by admins
        const updatedTask = await updateTask(formData);
        console.log('Task updated successfully:', updatedTask);
        
        NotificationManager.showTaskUpdated({
          ...(editingTask as Task), 
          ...formData
        });
      } else {
        // Create new task
        console.log('Creating new task with data:', formData);
        const createdTask = await createTask(formData as CreateTaskInput);
        console.log('Task created successfully:', createdTask);
        
        // Reset lastFetchTime and force an immediate refresh
        setLastFetchTime(0);
        
        // Force a refresh of the task list
        setTimeout(() => {
          console.log('Refreshing task list after task creation');
          fetchTasks();
        }, 300);
        
        NotificationManager.showSuccess('Task created successfully');
      }
      
      setModalOpened(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error('Error saving task:', error);
      NotificationManager.showError('Failed to save task');
    }
  };

  // Apply filters - if in admin view, show all tasks, otherwise filter by current user
  const filteredTasks = tasks.filter(task => {
    // Regular users can filter by created or assigned tasks
    if (!adminView && user) {
      if (viewMode === 'created') {
        // Show only tasks created by the current user
        const creatorId = task.userId || (task.user && task.user._id);
        if (!creatorId || (creatorId !== user.id)) {
          return false;
        }
      } else if (viewMode === 'assigned') {
        // Show only tasks assigned to the current user
        const assigneeId = task.assignedTo || (task.assignedUser && task.assignedUser._id);
        if (!assigneeId || (assigneeId !== user.id)) {
          return false;
        }
      } else {
        // Show both created and assigned tasks
        const creatorId = task.userId || (task.user && task.user._id);
        const assigneeId = task.assignedTo || (task.assignedUser && task.assignedUser._id);
        
        const isCreator = creatorId === user.id;
        const isAssignee = assigneeId === user.id;
        
        if (!isCreator && !isAssignee) {
          return false;
        }
      }
    }
    
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
        <Loader size="lg" />
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
          onClick={() => {
            setRetryCount(prev => prev + 1);
          }}
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
            {adminView ? 'All Tasks' : 'My Tasks'}
            {adminView && (
              <Badge size="sm" ml="xs">
                Admin View
              </Badge>
            )}
          </Title>
          <Group>
            {!adminView && (
              <Group>
                <Button.Group>
                  <Button 
                    variant={viewMode === 'all' ? 'filled' : 'light'}
                    onClick={() => setViewMode('all')}
                    size="sm"
                  >
                    All My Tasks
                  </Button>
                  <Button 
                    variant={viewMode === 'created' ? 'filled' : 'light'}
                    onClick={() => setViewMode('created')}
                    size="sm"
                  >
                    Created by Me
                  </Button>
                  <Button 
                    variant={viewMode === 'assigned' ? 'filled' : 'light'}
                    onClick={() => setViewMode('assigned')}
                    size="sm"
                  >
                    Assigned to Me
                  </Button>
                </Button.Group>
              </Group>
            )}
            {adminView && (
              <Button 
                variant="outline" 
                color="yellow"
                onClick={async () => {
                  try {
                    console.log('Testing admin API connection...');
                    const result = await adminApi.getUsersWithTaskCount();
                    console.log('Admin API test result:', result);
                    if (result.success && result.data) {
                      NotificationManager.showSuccess(`Successfully fetched ${result.data.length} users`);
                    } else {
                      NotificationManager.showError('API call failed: ' + (result.error || 'Unknown error'));
                    }
                  } catch (error) {
                    console.error('Admin API test error:', error);
                    NotificationManager.showError('Error testing admin API');
                  }
                }}
              >
                Test Admin API
              </Button>
            )}
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateTask}
            >
              New Task
            </Button>
          </Group>
        </Group>
        <TaskFilters filters={filters} onFilterChange={setFilters} adminMode={adminView} />
        <Stack gap="md">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
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