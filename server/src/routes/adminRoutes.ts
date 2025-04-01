import express from 'express';
import { getUsers, getUserById, getUsersWithTaskCount, getAllTasks } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Apply both protect and admin middleware to all routes
router.use(protect, admin);

// User management routes
router.get('/users', getUsers);
router.get('/users/with-tasks', getUsersWithTaskCount);
router.get('/users/:id', getUserById);

// Task management routes
router.get('/tasks', getAllTasks);

export default router; 