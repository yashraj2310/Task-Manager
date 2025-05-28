import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as taskService from '../services/taskService'; 
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err.message || 'Could not fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); 

  // Add Task
  const handleAddTask = async (taskData) => {
    setError('');
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks((prevTasks) => [newTask, ...prevTasks]); 
    } catch (err) {
      setError(err.message || 'Could not add task.');
    }
  };

  // Update Task
  const handleUpdateTask = async (taskId, taskData) => {
    setError('');
    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
      setEditingTask(null); // Clear editing state
    } catch (err) {
      setError(err.message || 'Could not update task.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    setError('');
    
    try {
      await taskService.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(err.message || 'Could not delete task.');
    }
  };

  const handleSetEditingTask = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleClearEditingTask = () => {
    setEditingTask(null);
  };

  const handleToggleStatus = async (taskId, newStatus) => {
    setError('');
    const originalTasks = [...tasks];
    
    setTasks(prevTasks => 
        prevTasks.map(task => 
            task._id === taskId ? { ...task, status: newStatus } : task
        )
    );

    try {
        await taskService.updateTask(taskId, { status: newStatus });
        
    } catch (err) {
        setError(err.message || 'Could not update task status.');
        setTasks(originalTasks); 
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome, {currentUser?.username || 'User'}!
        </h2>
      </div>

      <TaskForm 
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        editingTask={editingTask}
        clearEditingTask={handleClearEditingTask}
      />

      {error && !editingTask && <p className="my-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Tasks</h3>
      <TaskList
        tasks={tasks}
        onDeleteTask={handleDeleteTask}
        onSetEditingTask={handleSetEditingTask}
        onToggleStatus={handleToggleStatus} 
        loading={loading}
      />
    </div>
  );
};

export default DashboardPage;