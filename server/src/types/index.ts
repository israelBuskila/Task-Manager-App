// Define the user document interface
export interface UserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the task document interface
export interface TaskDocument extends Document {
  _id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Completed' | 'Pending';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  reminderDate: Date;
  assignedTo?: string;
  user: string | UserDocument;
  createdAt: Date;
  updatedAt: Date;
}

// Auth credentials interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

// Extend Express Request to include user property
import { Request } from 'express';
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
