import { Request, Response } from 'express';
import Task from '../models/Task';

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { title, description, status, reminderDate } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status,
      reminderDate,
      user: req.user._id
    });
    
    res.status(201).json(task);
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
    const filterQuery: any = {};
    
    // If user is not admin, only show their tasks
    if (req.user.role !== 'admin') {
      filterQuery.user = req.user._id;
    }
    
    // Filter by status if provided
    if (status) {
      filterQuery.status = status;
    }
    
    const tasks = await Task.find(filterQuery)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
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
    
    const task = await Task.findById(req.params.id).populate('user', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to access this task
    if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }
    
    res.json(task);
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
    
    const { title, description, status, reminderDate } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to update this task
    if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // Update task fields
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.reminderDate = reminderDate || task.reminderDate;
    
    const updatedTask = await task.save();
    
    res.json(updatedTask);
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
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to delete this task
    if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    await task.deleteOne();
    
    res.json({ message: 'Task removed' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
