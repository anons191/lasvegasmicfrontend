import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser } from '../../utils/auth';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePicture: null,
    location: {
      coordinates: [0, 0]
    }
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          profilePicture: null,
          location: userData.location || { coordinates: [0, 0] }
        });
        setLoading(false);
      } catch (err) {
        setError('Error loading profile data');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleProfilePictureChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const profileData = new FormData();
      profileData.append('name', formData.name);
      profileData.append('bio', formData.bio);
      
      if (formData.profilePicture) {
        profileData.append('profilePicture', formData.profilePicture);
      }
      
      await axios.put('/api/users/me', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Redirect to profile page
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
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
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            className="form-control"
            value={formData.bio}
            onChange={handleInputChange}
            rows="4"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture</label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            className="form-control"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleProfilePictureChange}
          />
          <small className="text-muted">Maximum file size: 5MB</small>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
