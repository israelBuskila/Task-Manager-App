import { Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import { mapClientToServerStatus, mapServerToClientStatus } from '../controllers/taskController';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
    
    // Find all users
    const users = await User.find({}).select('-password');
    
    // Return user list
    res.json({ 
      success: true,
      data: users
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    // Find user by ID
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user
    res.json(user);
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user with task count
// @route   GET /api/admin/users/with-tasks
// @access  Private/Admin
export const getUsersWithTaskCount = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
    
    // Find all users
    const users = await User.find({}).select('-password');
    
    // Get task counts for each user
    const usersWithTasks = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({ user: user._id });
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tasksCount: taskCount,
          createdAt: user.createdAt
        };
      })
    );
    
    console.log(`Returning ${usersWithTasks.length} users with task counts`);
    
    // Return enhanced user list in standard response format
    res.json({
      success: true,
      data: usersWithTasks
    });
  } catch (error: any) {
    console.error('Get users with task count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get all tasks for admin view (can filter by user)
// @route   GET /api/admin/tasks
// @access  Private/Admin
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    // Parse filter parameters
    const status = req.query.status as string;
    const userId = req.query.userId as string;
    const filterQuery: any = {};
    
    // Filter by status if provided
    if (status) {
      // Map client status to server status for filtering
      filterQuery.status = mapClientToServerStatus(status);
    }
    
    // Filter by user if provided
    if (userId) {
      filterQuery.user = userId;
    }
    
    // Get all tasks with user data
    const tasks = await Task.find(filterQuery)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Map server status to client status for response
    const clientTasks = tasks.map(task => {
      const taskObj = task.toObject();
      return {
        ...taskObj,
        status: mapServerToClientStatus(taskObj.status)
      };
    });
    
    res.json(clientTasks);
  } catch (error: any) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 