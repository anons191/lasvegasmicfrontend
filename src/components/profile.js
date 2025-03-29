import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';  // Import the api instance
import { getCurrentUser, logout } from '../utils/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        console.log('👷 Fetched user data:', userData);
        console.log('🎪 Performance slots data:', userData.performanceSlots);
        if (userData.performanceSlots?.length > 0) {
          console.log('🔎 Slot type check:', typeof userData.performanceSlots[0].slot);
          console.log('🔎 Slot content:', userData.performanceSlots[0].slot);
        }
        setUser(userData);
      } catch (err) {
        setError('Error fetching profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancelRSVP = async (eventId) => {
    try {
      await api.delete(`/users/events/${eventId}/attend`);
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const handleCancelPerformance = async (eventId, slotId) => {
    try {
      await api.delete(`/users/events/${eventId}/slots/${slotId}`);
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel performance');
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      try {
        await api.put(`/events/${eventId}`, { status: 'cancelled' });
        const updatedUser = await getCurrentUser();
        setUser(updatedUser);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel event');
      }
    }
  };

  const handleUpdateNotificationPrefs = async (field, value) => {
    try {
      await api.put('/users/notification-preferences', { [field]: value });
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update preferences');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  if (!user) {
    return (
      <div className="error-container">
        <p>You need to be logged in to view this page.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  console.log("🎤 performanceSlots:", user.performanceSlots);
  
  return (
    <div className="profile-container">
      {error && <div className="alert alert-danger">{error}</div>}
      {console.log("▶️ activeTab:", activeTab)}

      <div className="profile-header">
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="user-type">
            {user.userType === 'guest' && 'Comedy Fan'}
            {user.userType === 'comedian' && 'Comedian'}
            {user.userType === 'host' && 'Open Mic Host'}
          </p>
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
        <div className="profile-actions">
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          <Link to="/edit-profile" className="btn btn-primary">Edit Profile</Link>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          My Events
        </button>
        <button
          className={`tab-button ${activeTab === 'performances' ? 'active' : ''}`}
          onClick={() => setActiveTab('performances')}
          style={{
            display: user?.userType === 'comedian' ? 'inline-block' : 'none',
          }}
        >
          My Performances
        </button>
        {user?.userType === 'host' && (
          <button
            className={`tab-button ${activeTab === 'hosted' ? 'active' : ''}`}
            onClick={() => setActiveTab('hosted')}
          >
            Hosted Events
          </button>
        )}
        {user?.userType === 'comedian' && (
          <button
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notification Settings
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'events' && (
          <div className="events-tab">
            <h2>Events I'm Attending</h2>
            {user.eventsAttending?.length > 0 ? (
              <div className="event-cards">
                {user.eventsAttending.map(event => (
                  <div key={event._id} className="card event-card">
                    {event.image ? (
                      <img src={`${process.env.REACT_APP_API_URL || ''}/api/image/${event.image}`} alt={event.name} className="card-img-top" />
                    ) : (
                      <div className="card-img-placeholder">No Image</div>
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{event.name}</h5>
                      <p className="venue"><i className="bi bi-geo-alt"></i> {event.venue}</p>
                      <p className="date"><i className="bi bi-calendar"></i> {new Date(event.date).toLocaleDateString()}</p>
                      <div className="card-actions">
                        <Link to={`/event/${event._id}`} className="btn btn-primary">View Details</Link>
                        <button className="btn btn-danger" onClick={() => handleCancelRSVP(event._id)}>Cancel RSVP</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="no-data">You're not attending any events.</p>}
          </div>
        )}

        {activeTab === 'performances' && user.userType === 'comedian' && (
          <div className="performances-tab">
            <h2>My Upcoming Performances</h2>
            {console.log('🎥 Rendering performances tab with:', user.performanceSlots)}
            {user.performanceSlots?.length > 0 ? (
              <div className="performance-list">
                {user.performanceSlots.map(p => {
                  console.log('🎷 Performance item:', p);
                  console.log('🕑 Slot data type:', typeof p.slot, p.slot);
                  
                  // Safety check for rendering
                  if (!p.event || typeof p.slot !== 'object' || !p.slot) {
                    console.error('⚠️ Invalid performance data:', p);
                    return (
                      <div key={p._id || 'error'} className="performance-card error">
                        <div className="performance-info">
                          <h3>{p.event?.name || 'Unknown Event'}</h3>
                          <p className="error-message">Error: Performance data incomplete</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Calculate formatted times with error handling
                  let formattedTime = 'Time unavailable';
                  let slotNumber = 'Unknown';
                  
                  try {
                    if (p.slot?.startTime) {
                      formattedTime = new Date(p.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    slotNumber = p.slot?.order || 'Unknown';
                  } catch (error) {
                    console.error('⛔ Time formatting error:', error);
                  }
                  
                  return (
                    <div key={`${p.event?._id}-${p.slot?._id}`} className="performance-card">
                      <div className="performance-info">
                        <h3>{p.event?.name}</h3>
                        <p className="venue"><i className="bi bi-geo-alt"></i> {p.event?.venue}</p>
                        <p className="date"><i className="bi bi-calendar"></i> {new Date(p.event?.date).toLocaleDateString()}</p>
                        <p className="time"><i className="bi bi-clock"></i> {formattedTime}</p>
                        <p className="slot-info"><i className="bi bi-mic"></i> Slot #{slotNumber}</p>
                      </div>
                      <div className="performance-actions">
                        <Link to={`/event/${p.event?._id}`} className="btn btn-primary">View Event</Link>
                        <button className="btn btn-danger" onClick={() => handleCancelPerformance(p.event?._id, p.slot?._id)}>Cancel Performance</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="no-data">No upcoming performances.</p>}
          </div>
        )}

        {activeTab === 'hosted' && user.userType === 'host' && (
          <div className="hosted-tab">
            <h2>Events I'm Hosting</h2>
            <div className="create-event-btn">
              <Link to="/create-event" className="btn btn-success"><i className="bi bi-plus-circle"></i> Create Event</Link>
            </div>
            {user.eventsHosting?.length > 0 ? (
              <div className="event-cards">
                {user.eventsHosting.map(event => (
                  <div key={event._id} className="card event-card">
                    {event.image ? (
                      <img src={`${process.env.REACT_APP_API_URL || ''}/api/image/${event.image}`} alt={event.name} className="card-img-top" />
                    ) : <div className="card-img-placeholder">No Image</div>}
                    <div className="card-body">
                      <h5 className="card-title">{event.name}</h5>
                      <p className="venue"><i className="bi bi-geo-alt"></i> {event.venue}</p>
                      <p className="date"><i className="bi bi-calendar"></i> {new Date(event.date).toLocaleDateString()}</p>
                      <p className="attendees"><i className="bi bi-people"></i> {event.attendeeCount || 0} attendees</p>
                      <div className="card-actions">
                        <Link to={`/event/${event._id}`} className="btn btn-primary">View</Link>
                        <Link to={`/edit-event/${event._id}`} className="btn btn-secondary">Edit</Link>
                        <button className="btn btn-danger" onClick={() => handleCancelEvent(event._id)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="no-data">You're not hosting any events yet.</p>}
          </div>
        )}

        {activeTab === 'notifications' && user.userType === 'comedian' && (
          <div className="notifications-tab">
            <h2>Notification Preferences</h2>
            <div className="form-switch-group">
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="enableNotifications"
                  checked={user.notificationPreferences?.enableNotifications}
                  onChange={(e) => handleUpdateNotificationPrefs('enableNotifications', e.target.checked)}
                />
                <label htmlFor="enableNotifications" className="form-check-label">Enable All Notifications</label>
              </div>
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="availableSlotAlerts"
                  checked={user.notificationPreferences?.availableSlotAlerts}
                  disabled={!user.notificationPreferences?.enableNotifications}
                  onChange={(e) => handleUpdateNotificationPrefs('availableSlotAlerts', e.target.checked)}
                />
                <label htmlFor="availableSlotAlerts" className="form-check-label">New Slot Alerts</label>
              </div>
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="upcomingPerformanceReminders"
                  checked={user.notificationPreferences?.upcomingPerformanceReminders}
                  disabled={!user.notificationPreferences?.enableNotifications}
                  onChange={(e) => handleUpdateNotificationPrefs('upcomingPerformanceReminders', e.target.checked)}
                />
                <label htmlFor="upcomingPerformanceReminders" className="form-check-label">Performance Reminders</label>
              </div>
              <div className="form-group">
                <label htmlFor="reminderTime">Reminder Time</label>
                <select
                  id="reminderTime"
                  className="form-select"
                  value={user.notificationPreferences?.reminderTime}
                  onChange={(e) => handleUpdateNotificationPrefs('reminderTime', e.target.value)}
                  disabled={!user.notificationPreferences?.enableNotifications || !user.notificationPreferences?.upcomingPerformanceReminders}
                >
                  <option value="1hour">1 hour before</option>
                  <option value="1day">1 day before</option>
                  <option value="1week">1 week before</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
