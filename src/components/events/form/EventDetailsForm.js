import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const EventDetailsForm = ({ 
  formData, 
  handleInputChange, 
  handleAddressChange,
  markerPosition,
  mapCenter,
  handleMapClick
}) => {
  return (
    <div className="form-section">
      <h3>Event Details</h3>
      
      <div className="form-group">
        <label htmlFor="name">Event Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          required
        ></textarea>
      </div>
      
      <div className="form-group">
        <label htmlFor="venue">Venue Name *</label>
        <input
          type="text"
          id="venue"
          name="venue"
          className="form-control"
          value={formData.venue}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="street">Street Address *</label>
          <input
            type="text"
            id="street"
            name="street"
            className="form-control"
            value={formData.address.street}
            onChange={handleAddressChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            className="form-control"
            value={formData.address.city}
            onChange={handleAddressChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            name="state"
            className="form-control"
            value={formData.address.state}
            onChange={handleAddressChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="zipCode">Zip Code *</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            className="form-control"
            value={formData.address.zipCode}
            onChange={handleAddressChange}
            required
          />
        </div>
      </div>
      
      <div className="form-group map-container">
        <label>Event Location *</label>
        <p className="help-text">Click on the map to set the exact location of your event</p>
        
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
            onClick={handleMapClick}
          >
            {markerPosition && (
              <Marker position={markerPosition} />
            )}
          </GoogleMap>
      </div>
    </div>
  );
};

export default EventDetailsForm;
