import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import SubTask from '../models/SubTask.js';
import Task from '../models/Task.js'; 

const router = express.Router({ mergeParams: true }); // Important: mergeParams allows access to :taskId from parent router



// POST /api/tasks/:taskId/subtasks - Create a new sub-task for a specific task
router.post('/', protect, async (req, res) => {
  const { title, description, status } = req.body;
  const { taskId } = req.params; // Get taskId from the URL

  if (!title) {
    return res.status(400).json({ message: 'Sub-task title is required' });
  }

  try {
    // 1. Verify the parent task exists and belongs to the user
    const parentTask = await Task.findById(taskId);
    if (!parentTask) {
      return res.status(404).json({ message: 'Parent task not found' });
    }
    if (parentTask.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add sub-tasks to this task' });
    }

    // 2. Create the sub-task
    const subTask = await SubTask.create({
      title,
      description: description || '',
      status: status || 'todo',
      parentTask: taskId,
      user: req.user._id, // Assign user explicitly
    });
    res.status(201).json(subTask);
  } catch (error) {
    console.error("Error creating sub-task:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating sub-task' });
  }
});

// GET /api/tasks/:taskId/subtasks - Get all sub-tasks for a specific task
router.get('/', protect, async (req, res) => {
  const { taskId } = req.params;

  try {
    // Verify parent task ownership (optional here if just fetching, but good for consistency)
    const parentTask = await Task.findById(taskId);
    if (!parentTask) {
      return res.status(404).json({ message: 'Parent task not found' });
    }
    if (parentTask.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these sub-tasks' });
    }

    const subTasks = await SubTask.find({ parentTask: taskId, user: req.user._id }).sort({ createdAt: 'asc' }); // Or by preferred order
    res.status(200).json(subTasks);
  } catch (error) {
    console.error("Error fetching sub-tasks:", error);
    res.status(500).json({ message: 'Server error while fetching sub-tasks' });
  }
});

// PUT /api/tasks/:taskId/subtasks/:subTaskId - Update a sub-task (e.g., title, description, or status)
router.put('/:subTaskId', protect, async (req, res) => {
  const { title, description, status } = req.body;
  const { taskId, subTaskId } = req.params;

  try {
    const subTask = await SubTask.findOne({ _id: subTaskId, parentTask: taskId, user: req.user._id });

    if (!subTask) {
      return res.status(404).json({ message: 'Sub-task not found or you are not authorized' });
    }

    if (title !== undefined) subTask.title = title;
    if (description !== undefined) subTask.description = description;
    if (status !== undefined) subTask.status = status; // This is key for moving between Kanban columns

    if (subTask.isModified()) {
        await subTask.save();
    } else if (title === undefined && description === undefined && status === undefined) {
        return res.status(400).json({ message: 'No update fields provided for sub-task' });
    }

    res.status(200).json(subTask);
  } catch (error) {
    console.error("Error updating sub-task:", error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating sub-task' });
  }
});

// DELETE /api/tasks/:taskId/subtasks/:subTaskId - Delete a sub-task
router.delete('/:subTaskId', protect, async (req, res) => {
  const { taskId, subTaskId } = req.params;

  try {
    const subTask = await SubTask.findOne({ _id: subTaskId, parentTask: taskId, user: req.user._id });

    if (!subTask) {
      return res.status(404).json({ message: 'Sub-task not found or you are not authorized' });
    }

    await SubTask.deleteOne({ _id: subTaskId });
    res.status(200).json({ message: 'Sub-task deleted successfully', id: subTaskId });
  } catch (error) {
    console.error("Error deleting sub-task:", error);
    res.status(500).json({ message: 'Server error while deleting sub-task' });
  }
});

export default router;