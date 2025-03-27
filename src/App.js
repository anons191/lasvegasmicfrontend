import React, { useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
import PrivateRoute from './components/routing/PrivateRoute';
import { setAuthToken } from './utils/auth';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
            <Switch>
            <Route exact path="/" component={EventList} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/event/:id" component={EventDetails} />
            <Route exact path="/map" component={EventMap} />
            <PrivateRoute exact path="/profile" component={Profile} />
            <PrivateRoute exact path="/create-event" component={CreateEvent} />
            <PrivateRoute exact path="/edit-event/:id" component={EditEvent} />
            <PrivateRoute exact path="/edit-profile" component={EditProfile} />
            <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </Router>
    </LoadScript>
  );
}

export default App;
