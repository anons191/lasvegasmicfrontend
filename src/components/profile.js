import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser, logout } from '../utils/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const history = useHistory();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        console.log("Fetched user data:", userData); // <-- ADD THIS
        setUser(userData);
        setLoading(false);
      } catch (err) {
        setError('Error fetching profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const handleCancelRSVP = async (eventId) => {
    if (!eventId) return;
    try {
      await axios.delete(`/api/users/events/${eventId}/attend`);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const handleCancelPerformance = async (eventId, slotId) => {
    if (!eventId || !slotId) return;
    try {
      await axios.delete(`/api/users/events/${eventId}/slots/${slotId}`);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel performance');
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!eventId) return;
    if (window.confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      try {
        await axios.put(`/api/events/${eventId}`, { status: 'cancelled' });
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel event');
      }
    }
  };

  const handleUpdateNotificationPrefs = async (field, value) => {
    try {
      const preferences = { [field]: value };
      await axios.put('/api/users/notification-preferences', preferences);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notification preferences');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  if (!user) {
    return (
      <div className="error-container">
        <p>You need to be logged in to view this page</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {error && <div className="alert alert-danger">{error}</div>}

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
        <button className={`tab-button ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>My Events</button>
        {user.userType === 'comedian' && (
          <button className={`tab-button ${activeTab === 'performances' ? 'active' : ''}`} onClick={() => setActiveTab('performances')}>My Performances</button>
        )}
        {user.userType === 'host' && (
          <button className={`tab-button ${activeTab === 'hosted' ? 'active' : ''}`} onClick={() => setActiveTab('hosted')}>Hosted Events</button>
        )}
        {user.userType === 'comedian' && (
          <button className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notification Settings</button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'hosted' && user.userType === 'host' && (
          <div className="hosted-tab">
            <h2>Events I'm Hosting</h2>
            <div className="create-event-btn">
              <Link to="/create-event" className="btn btn-success">
                <i className="bi bi-plus-circle"></i> Create New Event
              </Link>
            </div>
            {user.eventsHosting?.length > 0 ? (
              <div className="event-cards">
                {user.eventsHosting.map((event, index) => (
                  event?._id ? (
                    <div key={event._id || index} className="card event-card">
                      {event.image ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL || ''}/api/image/${event.image}`}
                          className="card-img-top"
                          alt={event.name || 'Event'}
                        />
                      ) : (
                        <div className="card-img-placeholder">No Image</div>
                      )}
                      <div className="card-body">
                        <h5 className="card-title">{event.name}</h5>
                        {event.venue && <p className="card-text venue"><i className="bi bi-geo-alt"></i> {event.venue}</p>}
                        {event.date && <p className="card-text date"><i className="bi bi-calendar"></i> {new Date(event.date).toLocaleDateString()}</p>}
                        <p className="card-text attendees"><i className="bi bi-people"></i> {event.attendeeCount || 0} attendees</p>
                        <div className="card-actions">
                          <Link to={`/event/${event._id}`} className="btn btn-primary">View Details</Link>
                          <Link to={`/edit-event/${event._id}`} className="btn btn-secondary">Edit Event</Link>
                          <button className="btn btn-danger" onClick={() => handleCancelEvent(event._id)}>Cancel Event</button>
                        </div>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            ) : (
              <p className="no-data">You're not hosting any events yet.</p>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="events-tab">
            <h2>Events I'm Attending</h2>
            {user.eventsAttending?.length > 0 ? (
              <div className="event-cards">
                {user.eventsAttending.map(event => (
                  event?._id && (
                    <div key={event._id} className="card event-card">
                      {event.image ? (
                        <img src={`${process.env.REACT_APP_API_URL || ''}/api/image/${event.image}`} className="card-img-top" alt={event.name} />
                      ) : (
                        <div className="card-img-placeholder">No Image</div>
                      )}
                      <div className="card-body">
                        <h5 className="card-title">{event.name}</h5>
                        <p className="card-text venue"><i className="bi bi-geo-alt"></i> {event.venue}</p>
                        <p className="card-text date"><i className="bi bi-calendar"></i> {new Date(event.date).toLocaleDateString()}</p>
                        <div className="card-actions">
                          <Link to={`/event/${event._id}`} className="btn btn-primary">View Details</Link>
                          <button className="btn btn-danger" onClick={() => handleCancelRSVP(event._id)}>Cancel RSVP</button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <p className="no-data">You're not attending any upcoming events.</p>
            )}
          </div>
        )}

        {activeTab === 'performances' && user.userType === 'comedian' && (
          <div className="performances-tab">
            <h2>My Upcoming Performances</h2>
            {user.performanceSlots?.length > 0 ? (
              <div className="performance-list">
                {user.performanceSlots.map(performance => (
                  performance?.event?._id && performance?.slot?._id && (
                    <div key={`${performance.event._id}-${performance.slot._id}`} className="performance-card">
                      <div className="performance-info">
                        <h3>{performance.event.name}</h3>
                        <p className="venue"><i className="bi bi-geo-alt"></i> {performance.event.venue}</p>
                        <p className="date"><i className="bi bi-calendar"></i> {new Date(performance.event.date).toLocaleDateString()}</p>
                        <p className="time"><i className="bi bi-clock"></i> {new Date(performance.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="slot-info"><i className="bi bi-mic"></i> Slot #{performance.slot.order}</p>
                      </div>
                      <div className="performance-actions">
                        <Link to={`/event/${performance.event._id}`} className="btn btn-primary">View Event</Link>
                        <button className="btn btn-danger" onClick={() => handleCancelPerformance(performance.event._id, performance.slot._id)}>Cancel Performance</button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <p className="no-data">You don't have any upcoming performances scheduled.</p>
            )}
          </div>
        )}

        {activeTab === 'notifications' && user.userType === 'comedian' && (
          <div className="notifications-tab">
            <h2>Notification Preferences</h2>
            <div className="notification-settings">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="enableNotifications" checked={user.notificationPreferences.enableNotifications} onChange={e => handleUpdateNotificationPrefs('enableNotifications', e.target.checked)} />
                <label className="form-check-label" htmlFor="enableNotifications">Enable All Notifications</label>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="availableSlotAlerts" checked={user.notificationPreferences.availableSlotAlerts} disabled={!user.notificationPreferences.enableNotifications} onChange={e => handleUpdateNotificationPrefs('availableSlotAlerts', e.target.checked)} />
                <label className="form-check-label" htmlFor="availableSlotAlerts">New Available Performance Slots</label>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="upcomingPerformanceReminders" checked={user.notificationPreferences.upcomingPerformanceReminders} disabled={!user.notificationPreferences.enableNotifications} onChange={e => handleUpdateNotificationPrefs('upcomingPerformanceReminders', e.target.checked)} />
                <label className="form-check-label" htmlFor="upcomingPerformanceReminders">Upcoming Performance Reminders</label>
              </div>
              <div className="form-group">
                <label htmlFor="reminderTime">Reminder Time</label>
                <select id="reminderTime" className="form-select" value={user.notificationPreferences.reminderTime} onChange={e => handleUpdateNotificationPrefs('reminderTime', e.target.value)} disabled={!user.notificationPreferences.enableNotifications || !user.notificationPreferences.upcomingPerformanceReminders}>
                  <option value="1hour">1 hour before performance</option>
                  <option value="1day">1 day before performance</option>
                  <option value="1week">1 week before performance</option>
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