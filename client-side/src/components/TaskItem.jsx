import React from 'react';
import { Link } from 'react-router-dom';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TaskItem = ({ task, onDeleteTask, onSetEditingTask, onToggleStatus }) => {
  const handleStatusChange = (e) => {
    onToggleStatus(task._id, e.target.value);
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 my-3 transition-shadow hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          {/* Make the title a Link */}
          <Link to={`/task/${task._id}`} className="hover:underline">
            <h4 className="text-lg font-semibold text-gray-800 break-all">{task.title}</h4>
          </Link>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 break-all">{task.description}</p>
          )}
        </div>
        {/* ... rest of the component (status badge) ... */}
        <div className="flex-shrink-0 ml-4">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
            </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
        <div className="flex items-center space-x-2">
            <select 
                value={task.status} 
                onChange={handleStatusChange}
                className="text-xs border-gray-300 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                // Prevent click on select from navigating if Link wraps entire card
                onClick={(e) => e.stopPropagation()} 
            >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>
            <button
                onClick={(e) => { e.stopPropagation(); onSetEditingTask(task); }} // Stop propagation
                className="text-indigo-600 hover:text-indigo-800 font-medium"
                aria-label={`Edit task ${task.title}`}
            >
                Edit
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteTask(task._id); }} // Stop propagation
                className="text-red-600 hover:text-red-800 font-medium"
                aria-label={`Delete task ${task.title}`}
            >
                Delete
            </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;