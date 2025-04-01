'use client';

import {
  Group,
  Select,
  TextInput,
  Button,
  Stack,
  Paper,
  Title,
  MultiSelect,
  Badge,
  Text,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import type { TaskStatus, TaskPriority, TaskFilters as TaskFiltersType } from '@/types';
import { adminApi } from '@/lib/api/admin.api';
import { 
  IconCircleCheck, 
  IconClockHour3, 
  IconSquareRoundedCheck, 
  IconClock,
  IconSquare,
  IconSquareCheck,
  IconBolt,
  IconArrowDown,
  IconArrowUp,
} from '@tabler/icons-react';

const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'PENDING'];
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

// Map status to appropriate icon
const getStatusIcon = (status: TaskStatus) => {
  switch(status) {
    case 'TODO':
      return <IconSquare size={16} />;
    case 'IN_PROGRESS':
      return <IconClockHour3 size={16} />;
    case 'COMPLETED':
      return <IconSquareCheck size={16} />;
    case 'PENDING':
      return <IconClock size={16} />;
    default:
      return null;
  }
};

// Map priority to appropriate icon
const getPriorityIcon = (priority: TaskPriority) => {
  switch(priority) {
    case 'LOW':
      return <IconArrowDown size={16} />;
    case 'MEDIUM':
      return <IconBolt size={16} />;
    case 'HIGH':
      return <IconArrowUp size={16} />;
    default:
      return null;
  }
};

const statusOptions = TASK_STATUSES.map((status) => ({
  value: status,
  label: status,
  leftSection: getStatusIcon(status),
}));

const priorityOptions = TASK_PRIORITIES.map((priority) => ({
  value: priority,
  label: priority,
  leftSection: getPriorityIcon(priority),
}));

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
  adminMode?: boolean;
}

export function TaskFilters({ filters, onFilterChange, adminMode = false }: TaskFiltersProps) {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users if in admin mode
  useEffect(() => {
    if (!adminMode) return;
    
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
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
        console.error('Error fetching users for filter:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [adminMode]);

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
          <MultiSelect
            label="Status"
            placeholder="Select status"
            data={statusOptions}
            value={filters.status || []}
            onChange={(value) => handleFilterChange('status', value.length > 0 ? value : undefined)}
            clearable
          />
          
          <MultiSelect
            label="Priority"
            placeholder="Select priority"
            data={priorityOptions}
            value={filters.priority || []}
            onChange={(value) => handleFilterChange('priority', value.length > 0 ? value : undefined)}
            clearable
          />
        </Group>

        {adminMode && (
          <MultiSelect
            label="User"
            placeholder={isLoadingUsers ? "Loading users..." : "Filter by user"}
            data={users}
            value={filters.users || []}
            onChange={(value) => handleFilterChange('users', value)}
            clearable
            searchable
            disabled={isLoadingUsers}
          />
        )}

        <TextInput
          label="Search"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        {/* Display active filters */}
        {((filters.status && filters.status.length > 0) || 
          (filters.priority && filters.priority.length > 0) || 
          (filters.users && filters.users.length > 0) || 
          filters.search) && (
          <Group mt="xs">
            <Text size="sm" fw={500}>Active filters:</Text>
            {filters.status?.map((status) => (
              <Badge key={status} color="blue" variant="light" leftSection={getStatusIcon(status)}>
                Status: {status}
              </Badge>
            ))}
            {filters.priority?.map((priority) => (
              <Badge key={priority} color={priority === 'HIGH' ? 'red' : priority === 'MEDIUM' ? 'yellow' : 'gray'} variant="light" leftSection={getPriorityIcon(priority)}>
                Priority: {priority}
              </Badge>
            ))}
            {filters.users?.map((userId) => {
              const user = users.find(u => u.value === userId);
              return (
                <Badge key={userId} color="indigo" variant="light">
                  User: {user?.label || userId}
                </Badge>
              );
            })}
            {filters.search && (
              <Badge color="teal" variant="light">
                Search: {filters.search}
              </Badge>
            )}
          </Group>
        )}

        <Button variant="light" onClick={handleReset}>
          Reset Filters
        </Button>
      </Stack>
    </Paper>
  );
} 