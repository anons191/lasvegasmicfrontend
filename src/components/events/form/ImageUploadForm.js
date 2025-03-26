import React from 'react';

const ImageUploadForm = ({ handleImageChange }) => {
  return (
    <div className="form-section">
      <h3>Event Image</h3>
      <p className="help-text">Upload an image for your event (960×1200 recommended)</p>
      
      <div className="form-group">
        <input
          type="file"
          id="image"
          name="image"
          className="form-control"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
        />
        <small className="text-muted">Maximum file size: 5MB</small>
      </div>
    </div>
  );
};

export default ImageUploadForm;
