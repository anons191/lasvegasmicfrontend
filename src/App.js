import React, { useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import EventList from './components/Eventlist';
import Profile from './components/profile';
import EventDetails from './components/eventDetails';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EventMap from './components/map/EventMap';
import CreateEvent from './components/events/CreateEvent';
import EditEvent from './components/events/EditEvent';
import EditProfile from './components/profile/EditProfile';
import NotFound from './components/layout/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import VerifyWarning from './pages/VerifyWarning';
import PrivateRoute from './components/routing/PrivateRoute';
import { setAuthToken } from './utils/auth';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://69.62.68.62:5001/api';

function App() {
  useEffect(() => {
    // Check for token in local storage and set headers
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-warning" element={<VerifyWarning />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/map" element={<EventMap />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/create-event" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
            <Route path="/edit-event/:id" element={<PrivateRoute><EditEvent /></PrivateRoute>} />
            <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LoadScript>
  );
}

export default App;
