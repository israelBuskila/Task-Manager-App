import { 
  TextInput, 
  Textarea, 
  Select, 
  Button, 
  Group, 
  Stack,
  Paper,
  Title,
  Switch,
  Divider,
  Text
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Task, CreateTaskInput } from '@/types';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/user.api';
import { NotificationManager } from '@/lib/notifications';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' }
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }
];

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: CreateTaskInput & { userId?: string }) => void;
  onCancel: () => void;
  adminMode?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, adminMode = false }: TaskFormProps) {
  const isEditing = !!task;
  const [users, setUsers] = useState<{value: string, label: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSideMounted, setClientSideMounted] = useState(false);
  
  // Set clientSideMounted after initial render
  useEffect(() => {
    setClientSideMounted(true);
  }, []);
  
  // Helper function to get the correct user ID from the task object
  const getUserIdFromTask = () => {
    // For MongoDB objects, the user field contains the actual user object with _id
    if (task?.user?._id) {
      return task.user._id;
    }
    
    // For client objects, userId might be set directly
    if (task?.userId) {
      return task.userId;
    }
    
    return undefined;
  };
  
  // Helper function to get the assigned user ID
  const getAssignedUserIdFromTask = () => {
    // Check different possible locations for assigned user ID
    if (task?.assignedTo) {
      return task.assignedTo;
    }
    
    if (task?.assignedUser?._id) {
      return task.assignedUser._id;
    }
    
    // If no assignment and editing, default to creator
    if (isEditing) {
      const creatorId = getUserIdFromTask();
      if (creatorId) {
        return creatorId;
      }
    }
    
    // For new tasks, we'll let the server handle default assignment
    return '';
  };
  
  // Fetch users for admin mode
  useEffect(() => {
    if (!adminMode) return;
    
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.getUsersWithTaskCount();
        
        if (response.success && response.data && response.data.length > 0) {
          const formattedUsers = response.data.map(user => ({
            value: user._id,
            label: `${user.firstName} ${user.lastName} (${user.email})`
          }));
          setUsers(formattedUsers);
        } else {
          setFallbackMockUsers();
        }
      } catch (error) {
        setFallbackMockUsers();
      } finally {
        setIsLoading(false);
      }
    };
    
    const setFallbackMockUsers = () => {
      // Provide fallback mock data
      const mockUsers = [
        { value: '1', label: 'John Doe (john@example.com)' },
        { value: '2', label: 'Jane Smith (jane@example.com)' },
        { value: '3', label: 'Admin User (admin@example.com)' }
      ];
      setUsers(mockUsers);
    };
    
    fetchUsers();
  }, [adminMode]);
  
  // Format a date for form submission
  const formatDate = (date: any) => {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    try {
      return new Date(date);
    } catch (e) {
      return new Date();
    }
  };
  
  const form = useForm<CreateTaskInput & { userId?: string, assignedTo?: string }>({
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      dueDate: clientSideMounted && task?.dueDate ? formatDate(task.dueDate) : new Date(),
      reminderDate: clientSideMounted && task?.reminderDate ? formatDate(task.reminderDate) : new Date(),
      userId: getUserIdFromTask(),
      assignedTo: getAssignedUserIdFromTask()
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      dueDate: (value) => (!value ? 'Due date is required' : null),
      userId: (value) => (adminMode && isEditing && !value ? 'User assignment is required' : null),
      assignedTo: (value) => (adminMode && !value && users.length > 0 ? 'Task assignment is required' : null),
    }
  });

  const handleSubmit = () => {
    if (form.validate().hasErrors) {
      NotificationManager.showError('Please fill in all required fields');
      return;
    }
    
    try {
      // Submit the form values
      onSubmit(form.values);
    } catch (error) {
      NotificationManager.showError('Error creating task');
    }
  };

  return (
    <Paper p="md" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={3}>{isEditing ? 'Edit Task' : 'Create New Task'}</Title>
            {adminMode && (
              <Switch 
                label="Admin Mode"
                checked
                readOnly
              />
            )}
          </Group>
          
          {adminMode && (
            <>
              <Divider label="Task Assignment" labelPosition="center" />
              <Select
                label="Assign Task To"
                placeholder={
                  isLoading 
                    ? "Loading users..." 
                    : isEditing && form.values.assignedTo 
                      ? "Current assignment will be preserved if unchanged" 
                      : "Select user to assign"
                }
                data={users}
                required
                disabled={isLoading}
                error={form.errors.assignedTo}
                description={
                  form.values.assignedTo 
                    ? `Task assigned to user with ID: ${form.values.assignedTo}` 
                    : "This user will be responsible for completing the task"
                }
                {...form.getInputProps('assignedTo')}
              />
              <input type="hidden" {...form.getInputProps('userId')} />
            </>
          )}
          
          {!adminMode && (
            <>
              <input type="hidden" {...form.getInputProps('userId')} />
              <input type="hidden" {...form.getInputProps('assignedTo')} />
            </>
          )}
          
          <TextInput
            label="Title"
            placeholder="Task title"
            required
            {...form.getInputProps('title')}
          />
          
          <Textarea
            label="Description"
            placeholder="Task description"
            required
            minRows={3}
            autosize
            {...form.getInputProps('description')}
          />
          
          <Group grow>
            <Select
              label="Status"
              placeholder="Select status"
              data={STATUS_OPTIONS}
              required
              {...form.getInputProps('status')}
            />
            
            <Select
              label="Priority"
              placeholder="Select priority"
              data={PRIORITY_OPTIONS}
              required
              {...form.getInputProps('priority')}
            />
          </Group>
          
          <Group grow>
            {clientSideMounted ? (
              <>
                <DatePickerInput
                  label="Due Date"
                  placeholder="Select due date"
                  required
                  clearable={false}
                  {...form.getInputProps('dueDate')}
                />
                
                <DatePickerInput
                  label="Reminder Date"
                  placeholder="Select reminder date"
                  required
                  clearable={false}
                  {...form.getInputProps('reminderDate')}
                />
              </>
            ) : (
              <>
                <div>
                  <Text size="sm" fw={500}>Due Date</Text>
                  <div style={{ height: '36px', background: '#f1f3f5', borderRadius: '4px' }} />
                </div>
                <div>
                  <Text size="sm" fw={500}>Reminder Date</Text>
                  <div style={{ height: '36px', background: '#f1f3f5', borderRadius: '4px' }} />
                </div>
              </>
            )}
          </Group>
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}