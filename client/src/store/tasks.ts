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

// Track last fetch time to prevent excessive API calls
export const lastFetchTimeAtom = atom<number>(0);
const DEBOUNCE_INTERVAL = 5000; // 5 seconds

// Get tasks with optional filters
export const fetchTasksAtom = atom(
  null,
  async (get, set, filters?: TaskFilters) => {
    try {
      // Check if we've fetched recently to prevent excessive API calls
      const lastFetchTime = get(lastFetchTimeAtom);
      const now = Date.now();
      
      if (now - lastFetchTime < DEBOUNCE_INTERVAL) {
        console.log(`Skipping task fetch - last fetch was ${(now - lastFetchTime) / 1000}s ago`);
        return get(tasksAtom); // Return existing tasks
      }
      
      // Update last fetch time
      set(lastFetchTimeAtom, now);
      
      console.log('Fetching tasks...');
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
      console.log('Fetching tasks from URL:', url);
      
      // Add timeout for fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await api.get<Task[]>(url);
        clearTimeout(timeoutId);
        
        console.log('Task response:', response);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch tasks');
        }
        
        // If we received a cached response, keep using existing data
        if (response.cached) {
          console.log('Using cached task data');
          return get(tasksAtom);
        }
        
        // Only update the atom if we have new data
        if (response.data) {
          set(tasksAtom, response.data);
        }
        
        if (filters) {
          set(taskFiltersAtom, filters);
        }
        
        return response.data || get(tasksAtom);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again later.');
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      console.error('Error fetching tasks:', errorMessage);
      set(errorAtom, errorMessage);
      throw error;
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Create a new task
export const createTaskAtom = atom(
  null,
  async (get, set, taskData: CreateTaskInput & { userId?: string, assignedTo?: string }) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      // Reset the last fetch time to ensure we can fetch immediately after creation
      set(lastFetchTimeAtom, 0);
      
      // Extract fields if provided
      const { userId, assignedTo, ...taskCreateData } = taskData;
      
      // Prepare data to send to API
      const dataToSend: any = { ...taskCreateData };
      
      // Add userId if specified (admin creating task for another user)
      if (userId) {
        dataToSend.userId = userId;
      }
      
      // Add assignedTo if specified
      if (assignedTo) {
        dataToSend.assignedTo = assignedTo;
      }
      
      console.log('Sending task creation request:', dataToSend);
      const response = await api.post<Task>(TASK_ENDPOINTS.CREATE, dataToSend);
      console.log('Task creation response:', response);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create task');
      }
      
      // Update task list with the new task
      const currentTasks = get(tasksAtom);
      const newTask = response.data as Task; // Ensure it's not undefined
      console.log('Adding new task to state:', newTask);
      
      // Add the new task to the beginning of the array
      set(tasksAtom, [newTask, ...currentTasks]);
      
      return newTask;
    } catch (error) {
      console.error('Task creation error:', error);
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
  async (get, set, taskData: UpdateTaskInput & { userId?: string, assignedTo?: string, _id?: string }) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      // Get task ID from either id or _id field
      const taskId = taskData.id || taskData._id;
      
      // Validate that we have a proper task ID
      if (!taskId || taskId === 'undefined') {
        console.error('Invalid task ID in updateTaskAtom:', taskData);
        throw new Error('Invalid task ID. Cannot update task.');
      }

      console.log('Updating task with ID:', taskId, 'and data:', taskData);
      
      // Ensure we're passing the ID in the format the API expects
      const dataToSend = {
        ...taskData,
        id: taskId
      };
      
      // Extract fields to send to the API
      const { userId, assignedTo, _id, ...taskUpdateData } = dataToSend;
      
      // Prepare final data object with special fields
      const finalData: any = { ...taskUpdateData };
      
      // Note: userId is not sent during updates as task creator cannot be changed
      
      // Add assignedTo if provided
      if (assignedTo) {
        finalData.assignedTo = assignedTo;
      }
      
      const url = TASK_ENDPOINTS.UPDATE(taskId);
      console.log('API request URL:', url);
      console.log('API request data:', finalData);
      
      const response = await api.put<Task>(url, finalData);
      console.log('API response:', response);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update task');
      }
      
      // Update the task in the local state
      const currentTasks = get(tasksAtom);
      const updatedTask = response.data as Task; 
      
      // Ensure the updatedTask has an id property (for consistency)
      if (!updatedTask.id && updatedTask._id) {
        updatedTask.id = updatedTask._id;
      }
      
      const updatedTasks = currentTasks.map(task => {
        const taskIdentifier = task.id || task._id;
        const updatedIdentifier = updatedTask.id || updatedTask._id;
        return taskIdentifier === updatedIdentifier ? updatedTask : task;
      });
      
      set(tasksAtom, updatedTasks);
      
      return updatedTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      console.error('Error updating task:', errorMessage);
      set(errorAtom, errorMessage);
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
      
      console.log('Deleting task with ID:', taskId);
      
      // Validate that we have a proper task ID
      if (!taskId || taskId === 'undefined') {
        console.error('Invalid task ID in deleteTaskAtom:', taskId);
        throw new Error('Invalid task ID. Cannot delete task.');
      }
      
      // Verify the task exists in our local state before attempting deletion
      const currentTasks = get(tasksAtom);
      const taskToDelete = currentTasks.find(task => {
        const taskIdentifier = task.id || task._id;
        return taskIdentifier === taskId;
      });
      
      if (!taskToDelete) {
        console.error(`Task with ID ${taskId} not found in local state. Available tasks:`, 
          currentTasks.map(t => ({ id: t.id, _id: t._id })));
        throw new Error('Task not found in local state.');
      }
      
      // Prepare the API URL
      const url = TASK_ENDPOINTS.DELETE(taskId);
      console.log('API request URL for deletion:', url);
      
      // Make the API call
      const response = await api.delete(url);
      console.log('API deletion response:', response);
      
      // Handle API error responses
      if (!response.success) {
        // Special handling for 404 Not Found responses
        if (response.error && response.error.includes('not found')) {
          console.error(`Task with ID ${taskId} not found on server. It may have been already deleted.`);
          
          // Even though the server didn't find it, remove it from local state anyway
          const updatedTasks = currentTasks.filter(task => {
            const taskIdentifier = task.id || task._id;
            return taskIdentifier !== taskId;
          });
          
          set(tasksAtom, updatedTasks);
          throw new Error('Task not found on server. It may have been already deleted.');
        }
        
        throw new Error(response.error || 'Failed to delete task');
      }
      
      // Remove the task from the local state
      const updatedTasks = currentTasks.filter(task => {
        // Check against both id and _id fields
        const taskIdentifier = task.id || task._id;
        return taskIdentifier !== taskId;
      });
      
      console.log(`Removed task ${taskId} from state. Tasks count before: ${currentTasks.length}, after: ${updatedTasks.length}`);
      set(tasksAtom, updatedTasks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      console.error('Error deleting task:', errorMessage);
      set(errorAtom, errorMessage);
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
  
  // Regular user only sees tasks they created
  return tasks.filter(task => {
    // Check if task was created by the current user
    const creatorId = task.userId || task.user?._id;
    return creatorId === user.id;
  });
}); 