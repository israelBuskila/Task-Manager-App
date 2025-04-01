// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

// Task related types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id?: string;
  _id?: string;  // MongoDB ID
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  reminderDate: Date;
  userId?: string;
  assignedTo?: string; // ID of the user this task is assigned to
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedUser?: {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  reminderDate: Date;
  assignedTo?: string; // ID of the user this task is assigned to
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  cached?: boolean;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  dueDate?: {
    from: Date;
    to: Date;
  };
  search?: string;
  users?: string[]; // Array of user IDs for filtering
  createdBy?: string; // Filter tasks created by specific user
  assignedTo?: string; // Filter tasks assigned to specific user
  userTasks?: string; // Filter tasks either created by or assigned to a user
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'task' | 'system' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  taskId?: string;
}

// Dashboard types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  upcomingTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
}

// Component Props types
export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  onCancel: () => void;
}

export interface TaskListProps {
  tasks: Task[];
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

// Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

export interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (task: CreateTaskInput) => Promise<void>;
  updateTask: (task: UpdateTaskInput) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    round: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
