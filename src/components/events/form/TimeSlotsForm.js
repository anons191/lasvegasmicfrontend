import React from 'react';

const TimeSlotsForm = ({ 
  formData, 
  newSlot, 
  handleNewSlotChange, 
  addTimeSlot, 
  removeTimeSlot,
  isEdit = false 
}) => {
  return (
    <div className="form-section">
      <h3>Performance Time Slots</h3>
      <p className="help-text">
        {isEdit 
          ? "Add or remove time slots for comedians to book. Note: Slots that are already booked cannot be removed."
          : "Add time slots for comedians to book for their performances"
        }
      </p>
      
      <div className="time-slots-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="slotStartTime">Slot Start Time</label>
            <input
              type="time"
              id="slotStartTime"
              name="startTime"
              className="form-control"
              value={newSlot.startTime}
              onChange={handleNewSlotChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="slotEndTime">Slot End Time</label>
            <input
              type="time"
              id="slotEndTime"
              name="endTime"
              className="form-control"
              value={newSlot.endTime}
              onChange={handleNewSlotChange}
            />
          </div>
          
          <div className="form-group add-slot-btn">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={addTimeSlot}
              disabled={!newSlot.startTime || !newSlot.endTime}
            >
              Add Slot
            </button>
          </div>
        </div>
        
        {formData.timeSlots.length > 0 ? (
          <div className="time-slots-list">
            <h4>Available Time Slots:</h4>
            <ul className="list-group">
              {formData.timeSlots.map((slot, index) => (
                <li key={index} className="list-group-item">
                  <div className="slot-info">
                    <span className="slot-time">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeTimeSlot(index)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="no-slots-message">No time slots added yet</p>
        )}
      </div>
    </div>
  );
};

export default TimeSlotsForm;
