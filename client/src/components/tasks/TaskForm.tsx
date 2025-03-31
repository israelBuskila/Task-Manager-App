import { 
  TextInput, 
  Textarea, 
  Select, 
  Button, 
  Group, 
  Stack,
  Paper,
  Title,
  Switch
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Task, CreateTaskInput } from '@/types';

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
  onSubmit: (task: CreateTaskInput) => void;
  onCancel: () => void;
  adminMode?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, adminMode = false }: TaskFormProps) {
  const isEditing = !!task;
  
  const form = useForm<CreateTaskInput>({
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      reminderDate: task?.reminderDate ? new Date(task.reminderDate) : new Date(),
      assignedTo: task?.assignedTo || ''
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      dueDate: (value) => (!value ? 'Due date is required' : null),
    }
  });

  const handleSubmit = () => {
    if (form.validate().hasErrors) {
      return;
    }
    onSubmit(form.values);
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
          </Group>
          
          <TextInput
            label="Assigned To"
            placeholder="Name of assignee"
            {...form.getInputProps('assignedTo')}
          />
          
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