import React, { useState, useEffect } from 'react';

const TaskForm = ({ onAddTask, onUpdateTask, editingTask, clearEditingTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending'); // Default status
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setStatus(editingTask.status);
    } else {
      // Reset form when not editing
      setTitle('');
      setDescription('');
      setStatus('pending');
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const taskData = { title, description, status };

    if (editingTask) {
      onUpdateTask(editingTask._id, taskData);
    } else {
      onAddTask(taskData);
    }
    // Clear form fields only if not editing (or handled by parent after successful update)
    if (!editingTask) {
        setTitle('');
        setDescription('');
        setStatus('pending');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white shadow-lg rounded-lg space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        {editingTask ? 'Edit Task' : 'Add New Task'}
      </h3>
      {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{error}</p>}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={clearEditingTask}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;