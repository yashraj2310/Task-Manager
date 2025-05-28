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


export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create task');
  }
};


export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axiosInstance.put(`/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update task');
  }
};


export const deleteTask = async (taskId) => {
  try {
    const response = await axiosInstance.delete(`/${taskId}`);
    return response.data; // Should be { message: 'Task removed successfully' }
  } catch (error) {
    console.error('Error deleting task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete task');
  }
};

export const getTaskWithSubTasks = async (taskId) => {
  try {
    const response = await axiosInstance.get(`/${taskId}`); //  GET /api/tasks/:taskId
    return response.data; // Expected: { task: {...}, subTasks: [...] }
  } catch (error) {
    console.error(`Error fetching task ${taskId} with sub-tasks:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch task ${taskId}`);
  }
};

export const getSubTasks = async (parentTaskId) => {
  try {
    //  URL structure: /api/tasks/:parentTaskId/subtasks
    const response = await axiosInstance.get(`/${parentTaskId}/subtasks`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sub-tasks for task ${parentTaskId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch sub-tasks');
  }
};

export const createSubTask = async (parentTaskId, subTaskData) => {
  try {
    const response = await axiosInstance.post(`/${parentTaskId}/subtasks`, subTaskData);
    return response.data;
  } catch (error) {
    console.error(`Error creating sub-task for task ${parentTaskId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create sub-task');
  }
};


export const updateSubTask = async (parentTaskId, subTaskId, subTaskData) => {
  try {
    const response = await axiosInstance.put(`/${parentTaskId}/subtasks/${subTaskId}`, subTaskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating sub-task ${subTaskId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update sub-task');
  }
};


export const deleteSubTask = async (parentTaskId, subTaskId) => {
  try {
    const response = await axiosInstance.delete(`/${parentTaskId}/subtasks/${subTaskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting sub-task ${subTaskId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete sub-task');
  }
};