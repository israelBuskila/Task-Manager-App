import mongoose, { Schema } from 'mongoose';
import { TaskDocument } from '../types';

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed', 'Pending'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  dueDate: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // Default 1 week from now
  },
  reminderDate: {
    type: Date,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before save
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model<TaskDocument>('Task', TaskSchema);
