import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';  // Import the api instance
import { getCurrentUser } from '../utils/auth';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        fetchEvents(currentPage, statusFilter);
      } catch (err) {
        fetchEvents(currentPage, statusFilter);
      }
    };

    fetchUserAndEvents();
  }, [currentPage, statusFilter]);

  const fetchEvents = async (page, status) => {
    try {
      const res = await api.get(`/events?page=${page}&limit=10&status=${status}`);
      setEvents(res.data.events);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Error fetching events');
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const renderAttendButton = (event) => {
    if (!user) {
      return (
        <Link to="/login" className="btn btn-outline-primary btn-sm">
          Login to Attend
        </Link>
      );
    }

    // Check if user is the host
    if (user._id === event.host._id) {
      return (
        <span className="badge bg-info">You're hosting</span>
      );
    }

    // Check if user is already attending
    const isAttending = event.attendees?.some(attendee => attendee.user === user._id);
    if (isAttending) {
      return (
        <span className="badge bg-success">You're attending</span>
      );
    }

    // Check if user is a comedian with a performance slot
    if (user.userType === 'comedian') {
      const isPerforming = user.performanceSlots?.some(
        slot => slot.event === event._id
      );
      if (isPerforming) {
        return (
          <span className="badge bg-warning">You're performing</span>
        );
      }
    }

    return (
      <Link to={`/event/${event._id}`} className="btn btn-outline-primary btn-sm">
        Attend
      </Link>
    );
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h2>Open Mic Events</h2>
        {user && user.userType === 'host' && (
          <Link to="/create-event" className="btn btn-primary">
            Create New Event
          </Link>
        )}
      </div>

      <div className="filter-controls">
        <select
          className="form-select"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
          <option value="all">All Events</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {events.length === 0 ? (
        <div className="no-events">
          <p>No events found.</p>
        </div>
      ) : (
        <div className="event-cards">
          {events.map(event => (
            <div key={event._id} className="card event-card">
              {event.image ? (
                <img 
                  src={`${process.env.REACT_APP_API_URL}/image/${event.image}`} 
                  className="card-img-top" 
                  alt={event.name} 
                />
              ) : (
                <div className="card-img-placeholder">No Image</div>
              )}
              <div className="card-body">
                <h5 className="card-title">{event.name}</h5>
                <p className="card-text venue">
                  <i className="bi bi-geo-alt"></i> {event.venue}
                </p>
                <p className="card-text date">
                  <i className="bi bi-calendar"></i> {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="card-text time">
                  <i className="bi bi-clock"></i> {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="card-actions">
                  <Link to={`/event/${event._id}`} className="btn btn-primary">
                    View Details
                  </Link>
                  {renderAttendButton(event)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages).keys()].map(page => (
              <li
                key={page + 1}
                className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventList;
