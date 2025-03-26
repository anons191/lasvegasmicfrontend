import React from 'react';

const DateTimeForm = ({ formData, handleInputChange }) => {
  return (
    <div className="form-section">
      <h3>Date & Time</h3>
      
      <div className="form-group">
        <label htmlFor="date">Event Date *</label>
        <input
          type="date"
          id="date"
          name="date"
          className="form-control"
          value={formData.date}
          onChange={handleInputChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startTime">Start Time *</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            className="form-control"
            value={formData.startTime}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime">End Time *</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            className="form-control"
            value={formData.endTime}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DateTimeForm;
