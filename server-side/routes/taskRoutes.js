import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; 
import Task from '../models/Task.js'; 
import SubTask from '../models/SubTask.js';

const router = express.Router();



router.post('/', protect, async (req, res) => { 
    const { title, description, status } = req.body; 

    if (!title) { 
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const task = await Task.create({
            title,
            description: description || '', 
            status: status || 'pending',  
            user: req.user._id, 
        });
        res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error while creating task' });
    }
});

router.get('/', protect, async (req, res) => { 
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: 'Server error while fetching tasks' });
    }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Fetch associated sub-tasks
    const subTasks = await SubTask.find({ parentTask: task._id, user: req.user._id }).sort({ createdAt: 'asc' });

    // Send both task and its sub-tasks in the expected structure
    res.json({ task: task, subTasks: subTasks }); // <<<< KEY CHANGE HERE

  } catch (error) {
    console.error('Error fetching single task with subtasks:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});


router.put('/:id', protect, async (req, res) => { 
    const { title, description, status } = req.body; 
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this task' });
        }

        // Update fields if provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;

        // Check if anything was actually modified before saving
        if (task.isModified()) { 
            await task.save();
        } else if (title === undefined && description === undefined && status === undefined) {
            return res.status(400).json({ message: 'No update fields provided' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Task ID format' });
        }
        if (error.name === 'ValidationError') { // Mongoose validation errors
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error while updating task' });
    }
});

router.delete('/:id', protect, async (req, res) => { // Added protect here
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this task' });
        }

        await Task.deleteOne({ _id: taskId });


        res.status(200).json({ message: 'Task deleted successfully', id: taskId }); // Return ID for frontend
    } catch (error) {
        console.error("Error deleting task:", error);
         if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Task ID format' });
        }
        res.status(500).json({ message: 'Server error while deleting task' });
    }
});

export default router;