import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser, isAuthenticated } from '../utils/auth';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [attendingFor, setAttendingFor] = useState('');
  const [isAttending, setIsAttending] = useState(false);
  const [isPerforming, setIsPerforming] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    const fetchEventAndUser = async () => {
      try {
        // Fetch event details
        const eventRes = await axios.get(`/api/events/${id}`);
        setEvent(eventRes.data);
        
        // If user is authenticated, fetch user details
        if (isAuthenticated()) {
          const userData = await getCurrentUser();
          setUser(userData);
          
          // Check if user is attending this event
          const attending = userData.eventsAttending?.some(
            eventId => eventId === id
          );
          setIsAttending(attending);
          
          // Check if user is performing at this event
          const performing = userData.performanceSlots?.some(
            slot => slot.event === id
          );
          setIsPerforming(performing);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching event details');
        setLoading(false);
      }
    };

    fetchEventAndUser();
  }, [id]);

  const handleAttend = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    try {
      await axios.post(`/api/users/events/${id}/attend`, { attendingFor });
      setIsAttending(true);
      // Refresh event data to update attendee count
      const eventRes = await axios.get(`/api/events/${id}`);
      setEvent(eventRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to RSVP for this event');
    }
  };

  const handleCancelAttend = async () => {
    try {
      await axios.delete(`/api/users/events/${id}/attend`);
      setIsAttending(false);
      // Refresh event data to update attendee count
      const eventRes = await axios.get(`/api/events/${id}`);
      setEvent(eventRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    
    try {
      await axios.post(`/api/users/events/${id}/slots/${selectedSlot}`);
      setIsPerforming(true);
      // Refresh event data to update slot status
      const eventRes = await axios.get(`/api/events/${id}`);
      setEvent(eventRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book performance slot');
    }
  };

  const handleCancelSlot = async (slotId) => {
    try {
      await axios.delete(`/api/users/events/${id}/slots/${slotId}`);
      setIsPerforming(false);
      // Refresh event data to update slot status
      const eventRes = await axios.get(`/api/events/${id}`);
      setEvent(eventRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel performance slot');
    }
  };

  const handleCancelEvent = async () => {
    if (window.confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      try {
        await axios.put(`/api/events/${id}`, { status: 'cancelled' });
        navigate('/profile');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel event');
      }
    }
  };

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    const options = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (!event) {
    return <div className="error">Event not found</div>;
  }

  // Get available time slots (not taken)
  const availableSlots = event.timeSlots.filter(slot => !slot.isTaken);
  // Sort slots by order
  const sortedSlots = [...event.timeSlots].sort((a, b) => a.order - b.order);

  return (
    <div className="event-details-container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="event-header">
        <h1>{event.name}</h1>
        {event.status === 'cancelled' && (
          <div className="cancelled-badge">CANCELLED</div>
        )}
      </div>
      
      <div className="event-content">
        <div className="event-image">
          {event.image ? (
            <img 
              src={`${process.env.REACT_APP_API_URL || ''}/api/image/${event.image}`} 
              alt={event.name} 
            />
          ) : (
            <div className="image-placeholder">No Image Available</div>
          )}
        </div>
        
        <div className="event-info">
          <p className="venue">
            <i className="bi bi-geo-alt-fill"></i> <strong>Venue:</strong> {event.venue}
          </p>
          <p className="address">
            <i className="bi bi-map"></i> <strong>Address:</strong> {`${event.address.street}, ${event.address.city}, ${event.address.state} ${event.address.zipCode}`}
          </p>
          <p className="date">
            <i className="bi bi-calendar-event"></i> <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="time">
            <i className="bi bi-clock"></i> <strong>Time:</strong> {formatDateTime(event.startTime)} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="host">
            <i className="bi bi-person"></i> <strong>Hosted by:</strong> {event.host.name}
          </p>
          
          <div className="description">
            <h3>About This Event</h3>
            <p>{event.description}</p>
          </div>
          
          <div className="event-stats">
            <div className="stat">
              <span className="stat-number">{event.attendees.length}</span>
              <span className="stat-label">Attendees</span>
            </div>
            <div className="stat">
              <span className="stat-number">{event.timeSlots.filter(slot => slot.isTaken).length}</span>
              <span className="stat-label">Performers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{availableSlots.length}</span>
              <span className="stat-label">Available Slots</span>
            </div>
          </div>
          
          {/* Action buttons based on user type and status */}
          <div className="event-actions">
            {/* For guests */}
            {user && user.userType === 'guest' && !isAttending && event.status !== 'cancelled' && (
              <div className="attend-form">
                <div className="form-group">
                  <label htmlFor="attendingFor">Who are you attending for? (Optional)</label>
                  <input
                    type="text"
                    id="attendingFor"
                    className="form-control"
                    value={attendingFor}
                    onChange={(e) => setAttendingFor(e.target.value)}
                    placeholder="I'm attending to see..."
                  />
                </div>
                <button className="btn btn-primary" onClick={handleAttend}>
                  RSVP to Attend
                </button>
              </div>
            )}
            
            {user && user.userType === 'guest' && isAttending && (
              <button className="btn btn-danger" onClick={handleCancelAttend}>
                Cancel RSVP
              </button>
            )}
            
            {/* For comedians */}
            {user && user.userType === 'comedian' && !isPerforming && availableSlots.length > 0 && event.status !== 'cancelled' && (
              <div className="book-slot-form">
                <div className="form-group">
                  <label htmlFor="timeSlot">Select a performance slot:</label>
                  <select
                    id="timeSlot"
                    className="form-control"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  >
                    <option value="">Select a time slot...</option>
                    {availableSlots.map(slot => (
                      <option key={slot._id} value={slot._id}>
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={handleBookSlot}>
                  Book Performance Slot
                </button>
              </div>
            )}
            
            {user && user.userType === 'comedian' && isPerforming && (
              <div>
                <div className="alert alert-success">
                  You are performing at this event!
                </div>
                <button className="btn btn-danger" onClick={() => {
                  // Find the slot the comedian is booked for
                  const bookedSlot = event.timeSlots.find(
                    slot => slot.comedian?._id === user._id
                  );
                  if (bookedSlot) {
                    handleCancelSlot(bookedSlot._id);
                  }
                }}>
                  Cancel Performance
                </button>
              </div>
            )}
            
            {/* For hosts */}
            {user && user.userType === 'host' && user._id === event.host._id && event.status !== 'cancelled' && (
              <div className="host-actions">
                <Link to={`/edit-event/${id}`} className="btn btn-primary">
                  Edit Event
                </Link>
                <button className="btn btn-danger" onClick={handleCancelEvent}>
                  Cancel Event
                </button>
              </div>
            )}
            
            {/* For non-logged in users */}
            {!user && (
              <Link to="/login" className="btn btn-primary">
                Login to Attend or Perform
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Performance Schedule */}
      <div className="performance-schedule">
        <h3>Performance Schedule</h3>
        {sortedSlots.length === 0 ? (
          <p>No performance slots have been scheduled for this event yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Performer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedSlots.map(slot => (
                <tr key={slot._id}>
                  <td>
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    {slot.comedian ? slot.comedian.name : 'Available'}
                  </td>
                  <td>
                    {slot.isTaken ? (
                      <span className="badge bg-success">Booked</span>
                    ) : (
                      <span className="badge bg-info">Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Attendees */}
      <div className="attendees-section">
        <h3>Who's Attending</h3>
        {event.attendees.length === 0 ? (
          <p>No one has RSVP'd to this event yet. Be the first!</p>
        ) : (
          <ul className="attendees-list">
            {event.attendees.map(attendee => (
              <li key={attendee.user._id} className="attendee-item">
                <div className="attendee-name">{attendee.user.name}</div>
                {attendee.attendingFor && (
                  <div className="attending-for">Attending for: {attendee.attendingFor}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Back button */}
      <div className="back-link">
        <Link to="/" className="btn btn-secondary">
          Back to Events
        </Link>
      </div>
    </div>
  );
};

export default EventDetails;
