import axios from 'axios';

const API_URL = 'http://localhost:5001/api/tasks'; // Adjust if your backend port is different

// Helper to get the token from localStorage
const getToken = () => localStorage.getItem('token');

// Axios instance with default auth header (optional but convenient)
const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fetches all tasks for the logged-in user.
 */
export const getTasks = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
  }
};

/**
 * Creates a new task.
 * @param {object} taskData - { title, description, status }
 */
export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create task');
  }
};

/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} taskData - { title, description, status }
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axiosInstance.put(`/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update task');
  }
};

/**
 * Deletes a task.
 * @param {string} taskId - The ID of the task to delete.
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await axiosInstance.delete(`/${taskId}`);
    return response.data; // Should be { message: 'Task removed successfully' }
  } catch (error) {
    console.error('Error deleting task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete task');
  }
};