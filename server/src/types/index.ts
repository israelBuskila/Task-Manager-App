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
  reminderDate: Date;
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
