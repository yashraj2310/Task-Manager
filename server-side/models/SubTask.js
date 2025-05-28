import mongoose from 'mongoose';



const subTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Sub-task title is required'],
      trim: true,
    },
    description: { 
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'], 
      default: 'todo',
    },
    parentTask: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Task',
      index: true,
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const SubTask = mongoose.model('SubTask', subTaskSchema);

 export default SubTask;