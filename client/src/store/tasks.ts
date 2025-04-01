import { atom } from 'jotai';
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types';
import { api, TASK_ENDPOINTS } from '@/lib/api/index.api';
import { adminApi } from '@/lib/api/admin.api';
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
  async (get, set) => {
    try {
      const user = get(userAtom);
      if (!user) return [];

      const lastFetchTime = get(lastFetchTimeAtom);
      const now = Date.now();
      
      if (now - lastFetchTime < DEBOUNCE_INTERVAL) {
        console.log(`Skipping task fetch - last fetch was ${(now - lastFetchTime) / 1000}s ago`);
        return get(tasksAtom);
      }
      
      set(lastFetchTimeAtom, now);
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      try {
        let tasks: Task[];
        
        // Use adminApi for admin users, regular endpoint for others
        if (user.role === 'admin') {
          console.log('Fetching tasks as admin...');
          const filters = get(taskFiltersAtom);
          tasks = await adminApi.getAllTasks(filters);
          console.log(`Successfully fetched ${tasks.length} tasks as admin`);
        } else {
          // For regular users, only fetch their assigned tasks
          console.log('Fetching tasks as regular user...');
          const endpoint = `${TASK_ENDPOINTS.GET_ALL}?assignedTo=${user.id}`;
          const response = await api.get<Task[]>(endpoint);
          
          if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid response format from tasks API');
          }
          
          tasks = response.data;
          console.log(`Successfully fetched ${tasks.length} tasks as user`);
        }
        
        set(tasksAtom, tasks);
        return tasks;
      } catch (error: any) {
        console.error('Error in task fetch:', error);
        if (error.response) {
          console.error('Response error:', error.response.data);
          throw new Error(error.response.data?.message || error.response.data || error.message);
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
      
      const response = await api.post<Task>(TASK_ENDPOINTS.CREATE, dataToSend);
      
      if (!response.data) {
        throw new Error('Failed to create task');
      }
      
      // Update task list with the new task
      const currentTasks = get(tasksAtom);
      const newTask = response.data;
      
      // Add the new task to the beginning of the array
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

      if (!taskData.id) {
        throw new Error('Invalid task ID');
      }

      // Remove the id from the data to send to the API
      const { id, ...updateData } = taskData;

      const response = await api.put<Task>(TASK_ENDPOINTS.UPDATE(id), updateData);
      
      if (!response.data) {
        throw new Error('Failed to update task');
      }

      // Update the task in the local state
      const currentTasks = get(tasksAtom);
      const updatedTasks = currentTasks.map(task => {
        // Check both id and _id for MongoDB compatibility
        const taskId = task.id || task._id;
        if (taskId === id) {
          // Merge the existing task with the updated data
          return {
            ...task,
            ...response.data,
            // Ensure we keep the original id/_id
            id: task.id || response.data.id,
            _id: task._id || response.data._id
          };
        }
        return task;
      });
      
      set(tasksAtom, updatedTasks);
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
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
      if (response.status === 404) {
        console.error(`Task with ID ${taskId} not found on server. It may have been already deleted.`);
        
        // Even though the server didn't find it, remove it from local state anyway
        const updatedTasks = currentTasks.filter(task => {
          const taskIdentifier = task.id || task._id;
          return taskIdentifier !== taskId;
        });
        
        set(tasksAtom, updatedTasks);
        throw new Error('Task not found on server. It may have been already deleted.');
      }
      
      // Remove the task from the local state
      const updatedTasks = currentTasks.filter(task => {
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

// Filtered tasks atom - only handles client-side filtering
export const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filters = get(taskFiltersAtom);
  const user = get(userAtom);
  
  if (!user || !tasks) return [];
  
  let filteredTasks = tasks;
  
  // Apply status filter
  const statusFilters = filters?.status;
  if (statusFilters && statusFilters.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      statusFilters.includes(task.status)
    );
  }
  
  // Apply priority filter
  const priorityFilters = filters?.priority;
  if (priorityFilters && priorityFilters.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      priorityFilters.includes(task.priority)
    );
  }
  
  // Apply search filter
  const searchTerm = filters?.search?.trim();
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description.toLowerCase().includes(searchLower);
      const statusMatch = task.status.toLowerCase().includes(searchLower);
      const priorityMatch = task.priority.toLowerCase().includes(searchLower);
      
      // Check assigned user name if available
      const assignedUserName = task.assignedUser ? 
        `${task.assignedUser.firstName} ${task.assignedUser.lastName}`.toLowerCase() : '';
      const assignedUserMatch = assignedUserName.includes(searchLower);
      
      return titleMatch || descriptionMatch || statusMatch || priorityMatch || assignedUserMatch;
    });
  }
  
  return filteredTasks;
}); 