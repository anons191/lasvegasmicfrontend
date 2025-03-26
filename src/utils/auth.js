import axios from 'axios';

// Set auth token as default header for all axios requests
export const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    const res = await axios.get('/api/users/me');
    return res.data;
  } catch (err) {
    // If token is invalid, remove it
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      setAuthToken(null);
    }
    throw err;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  setAuthToken(null);
  window.location.href = '/login';
};
