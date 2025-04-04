import { Request, Response } from 'express';
import Task from '../models/Task';
import { TaskDocument } from '../types';
// Import the extended types
import '../types'; // This will ensure the Express namespace is extended

// Type for valid server status values
type ServerStatus = 'To Do' | 'In Progress' | 'Completed' | 'Pending';
// Type for valid client status values
type ClientStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';

// Map client status values to server status values
export const mapClientToServerStatus = (clientStatus: string): ServerStatus => {
  const statusMap: Record<string, ServerStatus> = {
    'TODO': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'PENDING': 'Pending'
  };
  
  return statusMap[clientStatus] || 'To Do';
};

// Map server status values to client status values
export const mapServerToClientStatus = (serverStatus: string): ClientStatus => {
  const statusMap: Record<string, ClientStatus> = {
    'To Do': 'TODO',
    'In Progress': 'IN_PROGRESS',
    'Completed': 'COMPLETED',
    'Pending': 'PENDING'
  };
  
  return statusMap[serverStatus as ServerStatus] || 'TODO';
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { title, description, status, reminderDate, priority, dueDate, userId, assignedTo } = req.body;
    
    // Map client status to server status
    const serverStatus = mapClientToServerStatus(status);
    
    const taskData: Partial<TaskDocument> & { [key: string]: any } = {
      title,
      description,
      status: serverStatus,
      reminderDate
    };
    
    // Determine task creator (user field)
    if (req.user.role === 'admin' && userId) {
      taskData.user = userId;
    } else {
      // Regular user or admin creating task for themselves
      taskData.user = req.user._id;
    }
    
    // Determine task assignee (assignedTo field)
    if (assignedTo) {
      // If explicitly provided (admin can assign to anyone)
      taskData.assignedTo = assignedTo;
    } else {
      // By default, assign to the task creator
      taskData.assignedTo = taskData.user as string;
    }
    
    // Add optional fields if provided
    if (priority) taskData.priority = priority;
    if (dueDate) taskData.dueDate = new Date(dueDate);
    
    const task = await Task.create(taskData);
    
    // Convert server status back to client status for response
    const taskObj = task.toObject();
    const clientResponse = {
      ...taskObj,
      status: mapServerToClientStatus(taskObj.status)
    };
    
    res.status(201).json(clientResponse);
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all tasks (filtered by role)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Filter parameters
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const users = req.query.users as string;
    const search = req.query.search as string;
    const filterQuery: any = {};
    
    // Build the base query conditions
    const conditions: any[] = [];
    
    // If user is not admin, only show their tasks or tasks assigned to them
    if (req.user.role !== 'admin') {
      conditions.push({
        $or: [
          { user: req.user._id },
          { assignedTo: req.user._id }
        ]
      });
    }
    
    // Filter by status if provided
    if (status) {
      conditions.push({
        status: mapClientToServerStatus(status)
      });
    }
    
    // Filter by priority if provided
    if (priority) {
      const priorities = priority.split(',');
      conditions.push({
        priority: { $in: priorities }
      });
    }
    
    // Filter by users if provided (admin only)
    if (req.user.role === 'admin' && users) {
      const userIds = users.split(',');
      conditions.push({
        $or: [
          { user: { $in: userIds } },
          { assignedTo: { $in: userIds } }
        ]
      });
    }
    
    // Filter by search term if provided
    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Combine all conditions with $and
    if (conditions.length > 0) {
      filterQuery.$and = conditions;
    }
    
    console.log('MongoDB query:', JSON.stringify(filterQuery, null, 2));
    
    const tasks = await Task.find(filterQuery)
      .populate('user', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Map server status to client status for response
    const clientTasks = tasks.map(task => {
      const taskObj = task.toObject();
      return {
        ...taskObj,
        status: mapServerToClientStatus(taskObj.status),
        assignedUser: taskObj.assignedTo
      };
    });
    
    res.json(clientTasks);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Validate the task ID
    const taskId = req.params.id;
    if (!taskId || taskId === 'undefined') {
      return res.status(400).json({ message: 'Invalid task ID provided' });
    }
    
    const task = await Task.findById(taskId)
      .populate('user', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to access this task
    const isAdmin = req.user.role === 'admin';
    const isCreator = task.user.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo ? task.assignedTo.toString() === req.user._id.toString() : false;
    
    if (!isAdmin && !isCreator && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }
    
    // Map server status to client status for response
    const taskObj = task.toObject();
    const clientTask = {
      ...taskObj,
      status: mapServerToClientStatus(taskObj.status),
      assignedUser: taskObj.assignedTo
    };
    
    res.json(clientTask);
  } catch (error: any) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const taskId = req.params.id;
    if (!taskId || taskId === 'undefined') {
      return res.status(400).json({ message: 'Invalid task ID provided' });
    }
    
    const { title, description, status, reminderDate, priority, dueDate, assignedTo } = req.body;
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update task fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = mapClientToServerStatus(status) as any;
    if (reminderDate) task.reminderDate = new Date(reminderDate);
    if (priority) (task as any).priority = priority;
    if (dueDate) (task as any).dueDate = new Date(dueDate);
    
    // Only admin can reassign tasks
    if (assignedTo && req.user.role === 'admin') {
      task.assignedTo = assignedTo;
    }
    
    const updatedTask = await task.save();
    
    const taskObj = updatedTask.toObject();
    const clientTask = {
      ...taskObj,
      status: mapServerToClientStatus(taskObj.status),
      assignedUser: taskObj.assignedTo
    };
    
    res.json(clientTask);
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const taskId = req.params.id;
    if (!taskId || taskId === 'undefined') {
      return res.status(400).json({ message: 'Invalid task ID provided' });
    }
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
