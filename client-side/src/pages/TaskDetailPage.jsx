import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as taskService from '../services/taskService';

// Placeholder for SubTaskForm and KanbanColumn components (we'll create these next)
const SubTaskForm = ({ parentTaskId, onAddSubTask, editingSubTask, onUpdateSubTask, clearEditingSubTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(''); // Optional for sub-tasks

    useEffect(() => {
        if (editingSubTask) {
            setTitle(editingSubTask.title);
            setDescription(editingSubTask.description || '');
        } else {
            setTitle('');
            setDescription('');
        }
    }, [editingSubTask]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return; // Basic validation

        if (editingSubTask) {
            onUpdateSubTask(parentTaskId, editingSubTask._id, { title, description });
        } else {
            onAddSubTask(parentTaskId, { title, description, status: 'todo' }); // Default to 'todo'
        }
        setTitle('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-2">{editingSubTask ? 'Edit Sub-Task' : 'Add New Sub-Task'}</h4>
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Sub-task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div className="mb-3">
                <textarea
                    placeholder="Sub-task description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
            </div>
            <div className="flex items-center">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    {editingSubTask ? 'Update Sub-Task' : 'Add Sub-Task'}
                </button>
                {editingSubTask && (
                    <button 
                        type="button" 
                        onClick={clearEditingSubTask}
                        className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

const KanbanColumn = ({ title, statusKey, subTasks, onUpdateStatus, onSetEditingSubTask, onDeleteSubTask }) => {
    const getColumnColor = () => {
        switch(statusKey) {
            case 'todo': return 'border-gray-400';
            case 'in-progress': return 'border-blue-500';
            case 'review': return 'border-yellow-500';
            case 'done': return 'border-green-500';
            default: return 'border-gray-300';
        }
    };

    return (
        <div className={`bg-slate-100 p-3 rounded-lg shadow min-h-[200px] border-t-4 ${getColumnColor()}`}>
            <h3 className="font-semibold text-gray-700 mb-3 text-center">{title}</h3>
            <div className="space-y-2">
                {subTasks.map(sub => (
                    <div key={sub._id} className="bg-white p-3 rounded shadow-sm">
                        <p className="font-medium text-gray-800">{sub.title}</p>
                        {sub.description && <p className="text-xs text-gray-500 mt-1">{sub.description}</p>}
                        <div className="mt-2 flex justify-between items-center">
                            <select 
                                value={sub.status} 
                                onChange={(e) => onUpdateStatus(sub.parentTask, sub._id, e.target.value)}
                                className="text-xs border-gray-300 rounded text-gray-600"
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                            <div>
                                <button onClick={() => onSetEditingSubTask(sub)} className="text-xs text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                                <button onClick={() => onDeleteSubTask(sub.parentTask, sub._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {subTasks.length === 0 && <p className="text-xs text-gray-400 text-center">No sub-tasks</p>}
            </div>
        </div>
    );
};


const TaskDetailPage = () => {
  const { taskId } = useParams(); // Get taskId from URL
  const { currentUser } = useAuth(); // For user context if needed

  const [task, setTask] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSubTask, setEditingSubTask] = useState(null); // For editing a sub-task

  const KANBAN_COLUMNS = [
    { title: 'To Do', statusKey: 'todo' },
    { title: 'In Progress', statusKey: 'in-progress' },
    { title: 'Review', statusKey: 'review' },
    { title: 'Done', statusKey: 'done' },
  ];

  const loadTaskDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Assumes getTaskWithSubTasks returns { task: {...}, subTasks: [...] }
      const data = await taskService.getTaskWithSubTasks(taskId);
      setTask(data.task);
      setSubTasks(data.subTasks || []);
    } catch (err) {
      setError(err.message || `Could not fetch details for task ${taskId}.`);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      loadTaskDetails();
    }
  }, [taskId, loadTaskDetails]);

  const handleAddSubTask = async (parentTaskId, subTaskData) => {
    try {
      const newSubTask = await taskService.createSubTask(parentTaskId, subTaskData);
      setSubTasks(prev => [...prev, newSubTask]);
    } catch (err) {
      setError(err.message || 'Could not add sub-task.');
    }
  };

  const handleUpdateSubTaskStatus = async (parentTaskId, subTaskId, newStatus) => {
    const originalSubTasks = [...subTasks];
    // Optimistic update
    setSubTasks(prev => prev.map(st => st._id === subTaskId ? {...st, status: newStatus} : st));
    try {
      await taskService.updateSubTask(parentTaskId, subTaskId, { status: newStatus });
    } catch (err) {
      setError(err.message || 'Could not update sub-task status.');
      setSubTasks(originalSubTasks); // Revert on error
    }
  };

  const handleUpdateSubTaskDetails = async (parentTaskId, subTaskId, subTaskData) => {
     try {
        const updatedSubTask = await taskService.updateSubTask(parentTaskId, subTaskId, subTaskData);
        setSubTasks(prev => prev.map(st => st._id === subTaskId ? updatedSubTask : st));
        setEditingSubTask(null);
     } catch (err) {
        setError(err.message || 'Could not update sub-task details.');
     }
  };

  const handleDeleteSubTask = async (parentTaskId, subTaskId) => {
    // if (!window.confirm("Delete this sub-task?")) return;
    try {
        await taskService.deleteSubTask(parentTaskId, subTaskId);
        setSubTasks(prev => prev.filter(st => st._id !== subTaskId));
    } catch (err) {
        setError(err.message || 'Could not delete sub-task.');
    }
  };

  const handleSetEditingSubTask = (subTaskToEdit) => {
    setEditingSubTask(subTaskToEdit);
  };
  
  const handleClearEditingSubTask = () => {
    setEditingSubTask(null);
  };


  if (loading) return <div className="text-center py-10 text-gray-500">Loading task details...</div>;
  if (error) return <div className="text-center py-10 text-red-500 bg-red-100 p-4 rounded-md">Error: {error} <Link to="/dashboard" className="text-indigo-600 hover:underline ml-2">Go to Dashboard</Link></div>;
  if (!task) return <div className="text-center py-10 text-gray-500">Task not found. <Link to="/dashboard" className="text-indigo-600 hover:underline ml-2">Go to Dashboard</Link></div>;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="mb-6 pb-4 border-b border-gray-300">
        <Link to="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{task.title}</h1>
        {task.description && <p className="text-md text-gray-600 mt-1">{task.description}</p>}
        <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold">{task.status}</span></p>
      </div>

      <SubTaskForm 
        parentTaskId={taskId} 
        onAddSubTask={handleAddSubTask} 
        editingSubTask={editingSubTask}
        onUpdateSubTask={handleUpdateSubTaskDetails}
        clearEditingSubTask={handleClearEditingSubTask}
      />
      
      {error && <p className="my-2 text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map(column => (
          <KanbanColumn
            key={column.statusKey}
            title={column.title}
            statusKey={column.statusKey}
            subTasks={subTasks.filter(st => st.status === column.statusKey)}
            onUpdateStatus={handleUpdateSubTaskStatus}
            onSetEditingSubTask={handleSetEditingSubTask}
            onDeleteSubTask={handleDeleteSubTask}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskDetailPage;