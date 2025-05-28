import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { 
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: { 
      type: String,
      trim: true,
      default: '',
    },
    status: { 
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;

