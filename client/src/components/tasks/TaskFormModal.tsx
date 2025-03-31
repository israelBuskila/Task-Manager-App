'use client';

import { Modal } from '@mantine/core';
import { TaskForm } from './TaskForm';
import { Task, CreateTaskInput } from '@/types';

interface TaskFormModalProps {
  opened: boolean;
  onClose: () => void;
  task?: Task;
  onSubmit: (task: CreateTaskInput) => void;
  adminMode?: boolean;
}

export function TaskFormModal({ opened, onClose, task, onSubmit, adminMode = false }: TaskFormModalProps) {
  const handleSubmit = (formData: CreateTaskInput) => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={task ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      <TaskForm 
        task={task}
        onSubmit={handleSubmit}
        onCancel={onClose}
        adminMode={adminMode}
      />
    </Modal>
  );
} 