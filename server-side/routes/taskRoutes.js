import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Assuming this path is correct
import Task from '../models/Task.js'; 

const router = express.Router();

// Apply protect middleware to all routes in this router
// router.use(protect); // You can apply it globally here or per route.
// Applying per route as in our previous examples gives more granular control if needed.

// POST /api/tasks - Create a new task
router.post('/', protect, async (req, res) => { // Added protect here
    const { title, description, status } = req.body; // Expect title, description, status

    if (!title) { // Validate title
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const task = await Task.create({
            title,
            description: description || '', // Handle optional description
            status: status || 'pending',   // Handle optional status, default to pending
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

// GET /api/tasks - Get all tasks for the logged-in user
router.get('/', protect, async (req, res) => { // Added protect here
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: 'Server error while fetching tasks' });
    }
});

// GET /api/tasks/:id - Get a single task by ID (Added for completeness)
router.get('/:id', protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
  
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (task.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      res.json(task);
    } catch (error) {
      console.error(error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(500).json({ message: 'Server Error' });
    }
});


// PUT /api/tasks/:id - Update a task
router.put('/:id', protect, async (req, res) => { // Added protect here
    const { title, description, status } = req.body; // Expect title, description, status
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
        if (task.isModified()) { // General check for any modification
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

// DELETE /api/tasks/:id - Delete a task
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

        // await task.remove(); // remove() is deprecated in newer Mongoose
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