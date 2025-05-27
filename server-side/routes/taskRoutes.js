import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Task from '../models/Task.js'; 

const router = express.Router();

router.use(protect); // All routes below are protected

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Task text is required' });
    }

    try {
        const task = await Task.create({
            text,
            user: req.user._id, 
            completed: false,
        });
        res.status(201).json(task); // Mongoose model instance is returned
    } catch (error) {
        console.error("Error creating task:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error while creating task' });
    }
});

// GET /api/tasks - Get all tasks for the logged-in user
router.get('/', async (req, res) => {
    try {
        // Find tasks where the 'user' field matches the logged-in user's _id
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: 'Server error while fetching tasks' });
    }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
    const { text, completed } = req.body;
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        
        if (task.user.toString() !== req.user._id.toString()) {
        // Alternatively: if (!task.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'User not authorized to update this task' });
        }

        // Update fields if provided
        if (text !== undefined) task.text = text;
        if (completed !== undefined) task.completed = completed;

        // Only save if there were actual changes to text or completed status
        if (task.isModified('text') || task.isModified('completed')) {
            await task.save();
        } else if (text === undefined && completed === undefined) {
            // if no fields were sent to update
             return res.status(400).json({ message: 'No update fields provided' });
        }


        res.status(200).json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Task ID format' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error while updating task' });
    }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
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

        res.status(200).json({ message: 'Task deleted successfully', id: taskId });
    } catch (error) {
        console.error("Error deleting task:", error);
         if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Task ID format' });
        }
        res.status(500).json({ message: 'Server error while deleting task' });
    }
});

export default router;