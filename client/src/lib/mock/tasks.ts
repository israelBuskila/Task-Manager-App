import { Task } from '@/types';

/**
 * MOCK DATA FOR DEVELOPMENT ONLY
 * This data should only be used during development or for testing.
 * In production, all data should come from the actual API.
 */

// Create today's date for a reminder
const today = new Date();
// Create tomorrow's date for due date
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

export const mockTasks: Task[] = [
  {
    id: '7',
    title: 'Review Project Progress',
    description: 'Review the current progress of the task management application and plan next steps',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: tomorrow,
    reminderDate: today,
    userId: 'current-user',
    assignedTo: 'John Doe',
    createdAt: new Date('2024-03-29'),
    updatedAt: new Date('2024-03-29'),
  },
  {
    id: '1',
    title: 'Complete Project Documentation',
    description: 'Write comprehensive documentation for the task management application',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date('2024-04-15'),
    reminderDate: new Date('2024-04-14'),
    userId: 'admin-1',
    assignedTo: 'John Doe',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-21'),
  },
  {
    id: '2',
    title: 'Implement User Authentication',
    description: 'Set up JWT authentication and user session management',
    status: 'COMPLETED',
    priority: 'HIGH',
    dueDate: new Date('2024-03-25'),
    reminderDate: new Date('2024-03-24'),
    userId: 'admin-1',
    assignedTo: 'Jane Smith',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-25'),
  },
  {
    id: '3',
    title: 'Design Database Schema',
    description: 'Create and optimize database schema for the application',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    dueDate: new Date('2024-03-18'),
    reminderDate: new Date('2024-03-17'),
    userId: 'admin-1',
    assignedTo: 'Mike Johnson',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: '4',
    title: 'Create Task Dashboard',
    description: 'Develop a dashboard to display task statistics and progress',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: new Date('2024-04-01'),
    reminderDate: new Date('2024-03-31'),
    userId: 'admin-1',
    assignedTo: 'Sarah Wilson',
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-03-23'),
  },
  {
    id: '5',
    title: 'Implement Task Filters',
    description: 'Add filtering functionality for tasks by status, priority, and date',
    status: 'TODO',
    priority: 'LOW',
    dueDate: new Date('2024-04-05'),
    reminderDate: new Date('2024-04-04'),
    userId: 'admin-1',
    assignedTo: 'Tom Brown',
    createdAt: new Date('2024-03-24'),
    updatedAt: new Date('2024-03-24'),
  },
  {
    id: '6',
    title: 'Add Task Comments Feature',
    description: 'Implement the ability to add and manage comments on tasks',
    status: 'TODO',
    priority: 'LOW',
    dueDate: new Date('2024-04-10'),
    reminderDate: new Date('2024-04-09'),
    userId: 'admin-1',
    assignedTo: 'Emily Davis',
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-03-25'),
  },
]; 