'use client';

import { Card, Text, Group, Badge, ActionIcon, Menu } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import dayjs from 'dayjs';

const statusColors: Record<TaskStatus, string> = {
  TODO: 'blue',
  IN_PROGRESS: 'yellow',
  COMPLETED: 'green',
  PENDING: 'gray',
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'gray',
  MEDIUM: 'yellow',
  HIGH: 'red',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  showAssignee?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, showAssignee = false }: TaskCardProps) {
  const isOverdue = dayjs(task.dueDate).isBefore(dayjs(), 'day');

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg">
          {task.title}
        </Text>
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={() => onEdit(task)}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        {task.description}
      </Text>

      <Group gap="xs" mb="md">
        <Badge color={statusColors[task.status]}>
          {task.status}
        </Badge>
        <Badge color={priorityColors[task.priority]}>
          {task.priority}
        </Badge>
        {showAssignee && task.assignedTo && (
          <Badge color="blue" variant="outline">
            Assigned to: {task.assignedTo}
          </Badge>
        )}
      </Group>

      <Group gap="xs" justify="space-between">
        <Text size="sm" c={isOverdue ? 'red' : 'dimmed'}>
          Due: {dayjs(task.dueDate).format('MMM D, YYYY')}
        </Text>
        <Text size="sm" c="dimmed">
          Reminder: {dayjs(task.reminderDate).format('MMM D, YYYY')}
        </Text>
      </Group>
    </Card>
  );
} 