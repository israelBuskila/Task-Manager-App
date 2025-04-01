import { notifications } from '@mantine/notifications';
import { Task } from '@/types';

export class NotificationManager {
  static checkTaskReminders(tasks: Task[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Get tasks with reminders due today
    const tasksToRemind = tasks.filter(task => {
      if (task.status === 'COMPLETED') return false;
      
      const reminderDate = new Date(task.reminderDate);
      reminderDate.setHours(0, 0, 0, 0); // Start of reminder day
      
      return reminderDate.getTime() === today.getTime();
    });

    // Show notifications for tasks with reminders due today
    tasksToRemind.forEach(task => {
      this.showTaskReminder(task);
    });
    
    return tasksToRemind.length;
  }

  static showTaskReminder(task: Task, customMessage?: string) {
    const reminderDate = new Date(task.reminderDate).toLocaleDateString();
    
    notifications.show({
      title: task.title,
      message: customMessage || `This task has a reminder set for ${reminderDate}`,
      color: task.priority === 'HIGH' ? 'red' : 
             task.priority === 'MEDIUM' ? 'yellow' : 'blue',
      autoClose: 10000, // 10 seconds
      withCloseButton: true,
    });
  }

  static showTaskDueSoon(task: Task, daysLeft: number) {
    notifications.show({
      title: `Task Due Soon: ${task.title}`,
      message: `This task is due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`,
      color: 'orange',
      autoClose: 10000,
      withCloseButton: true,
    });
  }

  static showTaskCreated(task?: Task) {
    notifications.show({
      title: 'Task Created',
      message: task ? `"${task.title}" has been created successfully.` : 'Your task has been created successfully.',
      color: 'green',
      autoClose: 5000,
    });
  }

  static showTaskUpdated(task?: Task) {
    notifications.show({
      title: 'Task Updated',
      message: task ? `"${task.title}" has been updated successfully.` : 'Your task has been updated successfully.',
      color: 'green',
      autoClose: 5000,
    });
  }

  static showTaskDeleted(taskTitle?: string) {
    notifications.show({
      title: 'Task Deleted',
      message: taskTitle ? `"${taskTitle}" has been deleted successfully.` : 'Your task has been deleted successfully.',
      color: 'green',
      autoClose: 5000,
    });
  }

  static showTaskStatusChanged(task: Task) {
    notifications.show({
      title: 'Status Changed',
      message: `Task "${task.title}" status changed to ${task.status}.`,
      color: 'blue',
      autoClose: 5000,
    });
  }

  static showError(message: string) {
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
      autoClose: 8000,
    });
  }

  static showLogout() {
    notifications.show({
      title: 'Logged Out',
      message: 'You have been successfully logged out.',
      color: 'blue',
      autoClose: 3000,
    });
  }

  static showSuccess(message: string) {
    notifications.show({
      title: 'Success',
      message,
      color: 'green',
      autoClose: 5000,
    });
  }

  static showInfo(message: string) {
    notifications.show({
      title: 'Information',
      message,
      color: 'blue',
      autoClose: 5000,
    });
  }

  // Debug method to force show a reminder for testing
  static showTestReminder() {
    const testTask: Task = {
      id: 'test-1',
      title: 'Test Reminder Task',
      description: 'This is a test reminder notification',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      reminderDate: new Date(),
      userId: 'test-user',
      assignedTo: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.showTaskReminder(testTask);
    return true;
  }
} 