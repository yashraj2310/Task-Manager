import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth'; // Adjust if your backend port is different

export const registerUser = async (userData) => {
  try {
    // userData should be { username, email, password }
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data; 
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Registration failed');
    } else {
      throw new Error(error.message || 'Registration failed due to a network or server error');
    }
  }
};


export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data; 
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Login failed');
    } else {
      throw new Error(error.message || 'Login failed due to a network or server error');
    }
  }
};
