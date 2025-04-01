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
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin.api';
import { NotificationManager } from '@/lib/notification/notifications';

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
  onSubmit: (task: CreateTaskInput | UpdateTaskInput) => void;
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
            label: `${user.firstName} ${user.lastName}`
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        NotificationManager.showError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
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
  
  const form = useForm({
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      reminderDate: task?.reminderDate ? new Date(task.reminderDate) : new Date(),
      assignedTo: getAssignedUserIdFromTask()
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      status: (value) => (!value ? 'Status is required' : null),
      priority: (value) => (!value ? 'Priority is required' : null),
      dueDate: (value) => (!value ? 'Due date is required' : null),
      reminderDate: (value) => (!value ? 'Reminder date is required' : null)
    }
  });

  const handleSubmit = () => {
    if (form.validate().hasErrors) {
      NotificationManager.showError('Please fill in all required fields');
      return;
    }

    const formData = form.values;
    
    // For editing, ensure we have the correct task ID
    if (isEditing && task) {
      const taskId = task.id || task._id;
      if (!taskId) {
        NotificationManager.showError('Cannot update task: Missing task ID');
        return;
      }
      
      // Create update input with required fields
      const updateData: UpdateTaskInput = {
        id: taskId,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        reminderDate: formData.reminderDate,
        assignedTo: formData.assignedTo || undefined // Only include if it has a value
      };
      
      onSubmit(updateData);
    } else {
      // For creating new tasks
      onSubmit(formData as CreateTaskInput);
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
            </>
          )}
          
          {!adminMode && (
            <>
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