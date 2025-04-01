import { motion } from 'framer-motion';
import { TextInput, Textarea, Select, Button, Group, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';
import { useAtom } from 'jotai';
import { userAtom } from '@/store/auth';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin.api';

interface AnimatedTaskFormProps {
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  onCancel: () => void;
  initialData?: Task;
  adminView?: boolean;
}

export function AnimatedTaskForm({ onSubmit, onCancel, initialData, adminView = false }: AnimatedTaskFormProps) {
  const [currentUser] = useAtom(userAtom);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users if in admin mode
  useEffect(() => {
    if (!adminView) return;
    
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await adminApi.getUsersWithTaskCount();
        if (response.success && response.data) {
          const formattedUsers = response.data.map(user => ({
            value: user._id,
            label: `${user.firstName} ${user.lastName}`
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching users for assignment:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [adminView]);

  const form = useForm<CreateTaskInput | UpdateTaskInput>({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'TODO',
      priority: initialData?.priority || 'MEDIUM',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
      reminderDate: initialData?.reminderDate ? new Date(initialData.reminderDate) : new Date(),
      assignedTo: initialData?.assignedTo || initialData?.assignedUser?._id || (adminView ? '' : currentUser?.id),
      ...(initialData?.id && { id: initialData.id })
    },
  });

  const formAnimation = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        ease: [0.6, -0.05, 0.01, 0.99]
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemAnimation = {
    hidden: { 
      opacity: 0,
      x: -20,
      y: 10
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const buttonAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        delay: 0.5
      }
    },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: { scale: 0.95 }
  };

  const handleSubmit = (formData: CreateTaskInput | UpdateTaskInput) => {
    if (initialData?.id) {
      onSubmit({
        ...formData,
        id: initialData.id,
        assignedTo: initialData.assignedTo || initialData.assignedUser?._id
      } as UpdateTaskInput);
    } else {
      onSubmit(formData as CreateTaskInput);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={formAnimation}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <motion.div variants={itemAnimation}>
            <TextInput
              label="Title"
              placeholder="Enter task title"
              required
              {...form.getInputProps('title')}
            />
          </motion.div>

          <motion.div variants={itemAnimation}>
            <Textarea
              label="Description"
              placeholder="Enter task description"
              required
              minRows={3}
              {...form.getInputProps('description')}
            />
          </motion.div>

          {adminView && (
            <motion.div variants={itemAnimation}>
              <Select
                label="Assign To"
                placeholder={isLoadingUsers ? "Loading users..." : "Select user to assign"}
                data={users}
                searchable
                clearable={false}
                required
                disabled={isLoadingUsers}
                {...form.getInputProps('assignedTo')}
              />
            </motion.div>
          )}

          <Group grow>
            <motion.div variants={itemAnimation}>
              <Select
                label="Status"
                placeholder="Select status"
                data={[
                  { value: 'TODO', label: 'To Do' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'PENDING', label: 'Pending' },
                ]}
                {...form.getInputProps('status')}
              />
            </motion.div>

            <motion.div variants={itemAnimation}>
              <Select
                label="Priority"
                placeholder="Select priority"
                data={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]}
                {...form.getInputProps('priority')}
              />
            </motion.div>
          </Group>

          <Group grow>
            <motion.div variants={itemAnimation}>
              <DateInput
                label="Due Date"
                placeholder="Select due date"
                {...form.getInputProps('dueDate')}
              />
            </motion.div>

            <motion.div variants={itemAnimation}>
              <DateInput
                label="Reminder Date"
                placeholder="Select reminder date"
                {...form.getInputProps('reminderDate')}
              />
            </motion.div>
          </Group>

          <Group justify="flex-end" mt="md">
            <motion.div variants={buttonAnimation} whileHover="hover" whileTap="tap">
              <Button variant="subtle" onClick={onCancel}>
                Cancel
              </Button>
            </motion.div>
            <motion.div variants={buttonAnimation} whileHover="hover" whileTap="tap">
              <Button type="submit">
                {initialData ? 'Update Task' : 'Create Task'}
              </Button>
            </motion.div>
          </Group>
        </Stack>
      </form>
    </motion.div>
  );
} 