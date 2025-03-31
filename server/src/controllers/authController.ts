import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { LoginCredentials, RegisterCredentials } from '../types';

// Generate JWT token
const generateToken = (id: string): string => {
  // @ts-ignore
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
};

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role }: RegisterCredentials = req.body;
    console.log(req.body);
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user'
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginCredentials = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json({
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
