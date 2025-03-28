import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser } from '../../utils/auth';

import EventDetailsForm from './form/EventDetailsForm';
import DateTimeForm from './form/DateTimeForm';
import TimeSlotsForm from './form/TimeSlotsForm';
import ImageUploadForm from './form/ImageUploadForm';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

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

  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 36.1699, lng: -115.1398 });
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData.userType !== 'host') return navigate('/');
        setUser(userData);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => setMapCenter({ lat: coords.latitude, lng: coords.longitude }),
            () => {}
          );
        }
      } catch (err) {
        setError('You must be logged in as a host to create events');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
  };

  const handleImageChange = e => setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  const handleMapClick = e => setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });

  const handleNewSlotChange = e => {
    const { name, value } = e.target;
    setNewSlot(prev => ({ ...prev, [name]: value }));
  };

  const addTimeSlot = () => {
    if (newSlot.startTime >= newSlot.endTime) {
      setError('Start time must be before end time');
      return;
    }
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { ...newSlot }]
    }));
    setNewSlot({ startTime: '', endTime: '' });
  };

  const removeTimeSlot = index => {
    const updated = [...formData.timeSlots];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, timeSlots: updated }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const required = ['name', 'venue', 'date', 'startTime', 'endTime'];
    for (let key of required) {
      if (!formData[key]) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }
    }

    if (!markerPosition) {
      setError('Please select the event location on the map');
      setSubmitting(false);
      return;
    }

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

    if (formData.timeSlots.length > 0) {
      const slots = formData.timeSlots.map(slot => ({
        startTime: `${formData.date}T${slot.startTime}`,
        endTime: `${formData.date}T${slot.endTime}`
      }));
      eventData.append('timeSlots', JSON.stringify(slots));
    }

    if (formData.image) eventData.append('image', formData.image);

    try {
      const res = await axios.post('/api/events', eventData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/event/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="create-event-container">
      <h2>Create New Open Mic Event</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <EventDetailsForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleAddressChange={handleAddressChange}
          markerPosition={markerPosition}
          mapCenter={mapCenter}
          handleMapClick={handleMapClick}
        />

        <DateTimeForm 
          formData={formData}
          handleInputChange={handleInputChange}
        />

        <TimeSlotsForm 
          formData={formData}
          newSlot={newSlot}
          handleNewSlotChange={handleNewSlotChange}
          addTimeSlot={addTimeSlot}
          removeTimeSlot={removeTimeSlot}
          isEdit={false}
        />

        <ImageUploadForm handleImageChange={handleImageChange} />

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;