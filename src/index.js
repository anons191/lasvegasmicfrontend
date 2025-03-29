// Importing necessary libraries and dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Bootstrap CSS and icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import our custom CSS
import './index.css';
import './App.css';
// Importing the app and other components
import App from './App';
import reportWebVitals from './reportWebVitals';
// Log environment variable to verify it's being loaded
console.log('API URL from env:', process.env.REACT_APP_API_URL);


// ReactDOM render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Report Web Vitals
reportWebVitals();
