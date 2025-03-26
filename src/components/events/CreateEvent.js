import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser } from '../../utils/auth';

// Import form components
import EventDetailsForm from './form/EventDetailsForm';
import DateTimeForm from './form/DateTimeForm';
import TimeSlotsForm from './form/TimeSlotsForm';
import ImageUploadForm from './form/ImageUploadForm';

const CreateEvent = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    date: '',
    startTime: '',
    endTime: '',
    timeSlots: [],
    image: null
  });
  
  // Map state
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 36.1699, // Default to Las Vegas
    lng: -115.1398
  });
  
  // Time slot management
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: ''
  });
  
  useEffect(() => {
    const checkUserAndLoadLocation = async () => {
      try {
        // Check if user is authenticated and is a host
        const userData = await getCurrentUser();
        if (userData.userType !== 'host') {
          history.push('/');
          return;
        }
        setUser(userData);
        
        // Try to get user's current location for the map
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setMapCenter(pos);
              setLoading(false);
            },
            () => {
              // Error getting location, use default
              setLoading(false);
            }
          );
        } else {
          // Geolocation not supported
          setLoading(false);
        }
      } catch (err) {
        setError('You must be logged in as a host to create events');
        setLoading(false);
      }
    };
    
    checkUserAndLoadLocation();
  }, [history]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: value
      }
    });
  };
  
  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };
  
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
  };
  
  const handleNewSlotChange = (e) => {
    const { name, value } = e.target;
    setNewSlot({ ...newSlot, [name]: value });
  };
  
  const addTimeSlot = () => {
    // Validate that start time is before end time
    if (newSlot.startTime >= newSlot.endTime) {
      setError('Start time must be before end time');
      return;
    }
    
    // Add new slot to the list
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, { ...newSlot }]
    });
    
    // Reset new slot form
    setNewSlot({
      startTime: '',
      endTime: ''
    });
  };
  
  const removeTimeSlot = (index) => {
    const updatedSlots = [...formData.timeSlots];
    updatedSlots.splice(index, 1);
    setFormData({ ...formData, timeSlots: updatedSlots });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validate form
    if (!formData.name || !formData.venue || !formData.date || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }
    
    // Validate location marker
    if (!markerPosition) {
      setError('Please select the event location on the map');
      setSubmitting(false);
      return;
    }
    
    // Prepare form data for submission
    const eventData = new FormData();
    eventData.append('name', formData.name);
    eventData.append('description', formData.description);
    eventData.append('venue', formData.venue);
    eventData.append('address', JSON.stringify(formData.address));
    eventData.append('date', formData.date);
    eventData.append('startTime', `${formData.date}T${formData.startTime}`);
    eventData.append('endTime', `${formData.date}T${formData.endTime}`);
    eventData.append('longitude', markerPosition.lng);
    eventData.append('latitude', markerPosition.lat);
    
    // Add time slots
    if (formData.timeSlots.length > 0) {
      const timeSlotData = formData.timeSlots.map(slot => ({
        startTime: `${formData.date}T${slot.startTime}`,
        endTime: `${formData.date}T${slot.endTime}`
      }));
      eventData.append('timeSlots', JSON.stringify(timeSlotData));
    }
    
    // Add image if selected
    if (formData.image) {
      eventData.append('image', formData.image);
    }
    
    try {
      const res = await axios.post('/api/events', eventData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Redirect to the event page
      history.push(`/event/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="create-event-container">
      <h2>Create New Open Mic Event</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Event Details Section */}
        <EventDetailsForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleAddressChange={handleAddressChange}
          markerPosition={markerPosition}
          mapCenter={mapCenter}
          handleMapClick={handleMapClick}
        />
        
        {/* Date & Time Section */}
        <DateTimeForm 
          formData={formData}
          handleInputChange={handleInputChange}
        />
        
        {/* Time Slots Section */}
        <TimeSlotsForm 
          formData={formData}
          newSlot={newSlot}
          handleNewSlotChange={handleNewSlotChange}
          addTimeSlot={addTimeSlot}
          removeTimeSlot={removeTimeSlot}
          isEdit={false}
        />
        
        {/* Image Upload Section */}
        <ImageUploadForm 
          handleImageChange={handleImageChange}
        />
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
