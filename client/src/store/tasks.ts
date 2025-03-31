import { atom } from 'jotai';
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types';
import { api } from '@/utils/api';
import { TASK_ENDPOINTS } from '@/config/api';
import { userAtom } from './auth';

// Tasks state
export const tasksAtom = atom<Task[]>([]);
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);
export const taskFiltersAtom = atom<TaskFilters>({});

// Get tasks with optional filters
export const fetchTasksAtom = atom(
  null,
  async (get, set, filters?: TaskFilters) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      const currentFilters = filters || get(taskFiltersAtom);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (currentFilters.status && currentFilters.status.length > 0) {
        queryParams.set('status', currentFilters.status.join(','));
      }
      
      if (currentFilters.search) {
        queryParams.set('search', currentFilters.search);
      }
      
      const url = `${TASK_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
      const response = await api.get<Task[]>(url);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch tasks');
      }
      
      set(tasksAtom, response.data);
      
      if (filters) {
        set(taskFiltersAtom, filters);
      }
    } catch (error) {
      set(errorAtom, error instanceof Error ? error.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Create a new task
export const createTaskAtom = atom(
  null,
  async (get, set, taskData: CreateTaskInput) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      const response = await api.post<Task>(TASK_ENDPOINTS.CREATE, taskData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create task');
      }
      
      // Update task list with the new task
      const currentTasks = get(tasksAtom);
      const newTask = response.data as Task; // Ensure it's not undefined
      set(tasksAtom, [newTask, ...currentTasks]);
      
      return newTask;
    } catch (error) {
      set(errorAtom, error instanceof Error ? error.message : 'Failed to create task');
      throw error;
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Update an existing task
export const updateTaskAtom = atom(
  null,
  async (get, set, taskData: UpdateTaskInput) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      const url = TASK_ENDPOINTS.UPDATE(taskData.id);
      const response = await api.put<Task>(url, taskData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update task');
      }
      
      // Update the task in the local state
      const currentTasks = get(tasksAtom);
      const updatedTask = response.data as Task; // Ensure it's not undefined
      const updatedTasks = currentTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      
      set(tasksAtom, updatedTasks);
      
      return updatedTask;
    } catch (error) {
      set(errorAtom, error instanceof Error ? error.message : 'Failed to update task');
      throw error;
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Delete a task
export const deleteTaskAtom = atom(
  null,
  async (get, set, taskId: string) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      const url = TASK_ENDPOINTS.DELETE(taskId);
      const response = await api.delete(url);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete task');
      }
      
      // Remove the task from the local state
      const currentTasks = get(tasksAtom);
      const updatedTasks = currentTasks.filter(task => task.id !== taskId);
      
      set(tasksAtom, updatedTasks);
    } catch (error) {
      set(errorAtom, error instanceof Error ? error.message : 'Failed to delete task');
      throw error;
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Filter tasks by user role (admin sees all, user only sees their tasks)
export const filteredTasksAtom = atom(get => {
  const tasks = get(tasksAtom);
  const user = get(userAtom);
  
  if (!user) return [];
  
  // Admin sees all tasks
  if (user.role === 'admin') {
    return tasks;
  }
  
  // Regular user only sees their tasks
  return tasks.filter(task => task.userId === user.id);
}); 