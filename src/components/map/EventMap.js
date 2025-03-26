import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import { Link } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const EventMap = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(pos);
          fetchNearbyEvents(pos.lng, pos.lat);
        },
        () => {
          setError('Error: The Geolocation service failed.');
          setLoading(false);
          // Set default location (Las Vegas)
          const defaultPos = {
            lat: 36.1699,
            lng: -115.1398
          };
          setCurrentPosition(defaultPos);
          fetchNearbyEvents(defaultPos.lng, defaultPos.lat);
        }
      );
    } else {
      setError('Error: Your browser doesn\'t support geolocation.');
      setLoading(false);
      // Set default location (Las Vegas)
      const defaultPos = {
        lat: 36.1699,
        lng: -115.1398
      };
      setCurrentPosition(defaultPos);
      fetchNearbyEvents(defaultPos.lng, defaultPos.lat);
    }
  }, []);

  // Fetch nearby events
  const fetchNearbyEvents = async (longitude, latitude) => {
    try {
      const res = await axios.get(`/api/events/nearby?longitude=${longitude}&latitude=${latitude}&distance=20000`);
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching nearby events');
      setLoading(false);
    }
  };

  // Handle marker click
  const handleMarkerClick = (event) => {
    setSelectedEvent(event);
  };

  // Close info window
  const handleInfoWindowClose = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="map-container">
      <h2>Nearby Open Mics</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={12}
        >
          {/* Current location marker */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              icon={{
                url: '/images/current-location.png',
                scaledSize: new window.google.maps.Size(30, 30)
              }}
              title="Your location"
            />
          )}

          {/* Event markers */}
          {events.map(event => (
            <Marker
              key={event._id}
              position={{
                lat: event.location.coordinates[1],
                lng: event.location.coordinates[0]
              }}
              onClick={() => handleMarkerClick(event)}
              title={event.name}
            />
          ))}

          {/* Info window for selected event */}
          {selectedEvent && (
            <InfoWindow
              position={{
                lat: selectedEvent.location.coordinates[1],
                lng: selectedEvent.location.coordinates[0]
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="info-window">
                <h3>{selectedEvent.name}</h3>
                <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(selectedEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <Link to={`/event/${selectedEvent._id}`} className="btn btn-primary btn-sm">
                  View Details
                </Link>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Event list below map */}
      <div className="nearby-events-list">
        <h3>Events Near You</h3>
        {events.length === 0 ? (
          <p>No upcoming events found in your area.</p>
        ) : (
          <ul className="list-group">
            {events.map(event => (
              <li key={event._id} className="list-group-item">
                <div className="event-list-item">
                  <div className="event-info">
                    <h4>{event.name}</h4>
                    <p><strong>Venue:</strong> {event.venue}</p>
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <Link to={`/event/${event._id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventMap;
