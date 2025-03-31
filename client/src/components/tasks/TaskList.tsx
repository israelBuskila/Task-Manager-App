'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Button, Group, Text, Badge } from '@mantine/core';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskFormModal } from './TaskFormModal';
import { mockTasks } from '@/lib/mock/tasks';
import { Task, TaskFilters as TaskFiltersType, CreateTaskInput } from '@/types';
import { IconPlus, IconUsers } from '@tabler/icons-react';
import { NotificationManager } from '@/lib/notifications';

interface TaskListProps {
  adminView?: boolean;
}

export function TaskList({ adminView = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Check for tasks due soon (for notifications)
  useEffect(() => {
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

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, status };
        NotificationManager.showTaskStatusChanged(updatedTask);
        return updatedTask;
      }
      return task;
    }));
  };

  const handleTaskDelete = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    setTasks(tasks.filter(task => task.id !== taskId));
    if (taskToDelete) {
      NotificationManager.showTaskDeleted(taskToDelete.title);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpened(true);
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setModalOpened(true);
  };
  
  const handleTaskSubmit = (formData: CreateTaskInput) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => {
        if (task.id === editingTask.id) {
          const updatedTask = { 
            ...task, 
            ...formData, 
            updatedAt: new Date() 
          };
          NotificationManager.showTaskUpdated(updatedTask);
          return updatedTask;
        }
        return task;
      }));
    } else {
      // Create new task with a unique ID
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...formData,
        userId: 'current-user', // This would normally come from auth context
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTasks([newTask, ...tasks]);
      NotificationManager.showTaskCreated(newTask);
    }
    
    setModalOpened(false);
    setEditingTask(undefined);
  };

  // Apply filters - if in admin view, show all tasks, otherwise filter by current user
  const filteredTasks = tasks.filter(task => {
    // In a real app, we would check if the task belongs to the current user
    // For now, we're using mock data and showing all tasks in admin view
    if (!adminView) {
      // In a non-admin view, we'd filter by current user
      // This is a placeholder - in a real app, replace with actual user ID check
      if (task.userId !== 'current-user' && task.assignedTo !== 'John Doe') {
        return false;
      }
    }
    
    if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }
    if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
      return false;
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
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={handleCreateTask}
          >
            New Task
          </Button>
        </Group>
        <TaskFilters filters={filters} onFilterChange={setFilters} />
        <Stack gap="md">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleTaskEdit}
                onStatusChange={handleStatusChange}
                onDelete={handleTaskDelete}
                showAssignee={adminView}
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