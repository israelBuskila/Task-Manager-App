'use client';

import { Card, Text, Group, Badge, ActionIcon, Menu } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { userAtom } from '@/store/auth';

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
  showUser?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, showUser = false }: TaskCardProps) {
  const isOverdue = dayjs(task.dueDate).isBefore(dayjs(), 'day');
  const [currentUser] = useAtom(userAtom);
  const isAdmin = currentUser?.role === 'admin';
  
  // Get task ID from either id or _id fild
  const taskId = task.id || task._id;

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
              onClick={() => onDelete(taskId || '')}
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
        {isAdmin && showUser && task.user && (
          <Badge color="blue">
            Created by: {`${task.user.firstName} ${task.user.lastName}`}
          </Badge>
        )}
        {isAdmin && showUser && task.assignedUser && (
          <Badge color="indigo">
            Assigned to: {`${task.assignedUser.firstName} ${task.assignedUser.lastName}`}
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