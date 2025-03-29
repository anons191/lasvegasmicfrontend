import axios from 'axios';

// Get base URL from environment variable
const apiUrl = process.env.REACT_APP_API_URL || ''; // This will use the base URL set in the .env file
console.log('API URL:', process.env.REACT_APP_API_URL);  // Check if the environment variable is being loaded correctly

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: apiUrl,  // This is where we set the base URL
});

export default api;