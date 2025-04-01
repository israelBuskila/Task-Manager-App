import { Modal } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedTaskForm } from './AnimatedTaskForm';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

interface AnimatedTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  initialData?: Task;
  adminView?: boolean;
}

export function AnimatedTaskModal({ opened, onClose, onSubmit, initialData, adminView = false }: AnimatedTaskModalProps) {
  const modalAnimation = {
    hidden: {
      opacity: 0,
      scale: 0.85,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.85,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title={initialData ? 'Edit Task' : 'Create New Task'}
      transitionProps={{
        duration: 300,
        timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={initialData?._id || 'new'}
          variants={modalAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <AnimatedTaskForm
            onSubmit={(data) => {
              onSubmit(data);
              onClose();
            }}
            onCancel={onClose}
            initialData={initialData}
            adminView={adminView}
          />
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
} 