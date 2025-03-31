'use client';

import {
  Group,
  Select,
  TextInput,
  Button,
  Stack,
  Paper,
  Title,
} from '@mantine/core';
import type { TaskStatus, TaskPriority, TaskFilters as TaskFiltersType } from '@/types';

const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'PENDING'];
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const statusOptions = TASK_STATUSES.map((status) => ({
  value: status,
  label: status,
}));

const priorityOptions = TASK_PRIORITIES.map((priority) => ({
  value: priority,
  label: priority,
}));

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
}

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const handleFilterChange = (key: keyof TaskFiltersType, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack>
        <Title order={3}>Filters</Title>
        
        <Group grow>
          <Select
            label="Status"
            placeholder="Select status"
            data={statusOptions}
            value={filters.status?.[0]}
            onChange={(value) => handleFilterChange('status', value ? [value] : undefined)}
            clearable
          />
          
          <Select
            label="Priority"
            placeholder="Select priority"
            data={priorityOptions}
            value={filters.priority?.[0]}
            onChange={(value) => handleFilterChange('priority', value ? [value] : undefined)}
            clearable
          />
        </Group>

        <TextInput
          label="Search"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <Button variant="light" onClick={handleReset}>
          Reset Filters
        </Button>
      </Stack>
    </Paper>
  );
} 