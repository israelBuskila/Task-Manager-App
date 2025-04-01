'use client';

import { Modal, Alert } from '@mantine/core';
import { TaskForm } from './TaskForm';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';
import { useState } from 'react';
import { NotificationManager } from '@/lib/notification/notifications';

interface TaskFormModalProps {
  opened: boolean;
  onClose: () => void;
  task?: Task;
  onSubmit: (task: CreateTaskInput | UpdateTaskInput) => void;
  adminMode?: boolean;
}

export function TaskFormModal({ opened, onClose, task, onSubmit, adminMode = false }: TaskFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (formData: CreateTaskInput | UpdateTaskInput) => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (task?.id) {
        // For editing, include the task ID
        onSubmit({
          id: task.id,
          ...formData
        });
      } else {
        // For creating new tasks
        onSubmit(formData);
      }
      
      // Only close if successful
      onClose();
      
      // Show success notification
      NotificationManager.showSuccess(
        task?.id ? 'Task updated successfully' : 'Task created successfully'
      );
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={task ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      {error && (
        <Alert color="red" mb="lg" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <TaskForm 
        task={task}
        onSubmit={handleSubmit}
        onCancel={onClose}
        adminMode={adminMode}
      />
    </Modal>
  );
} 