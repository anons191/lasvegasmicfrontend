import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthToken, setUserVerification } from '../../utils/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    userType: 'guest' // Default user type
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, password2, userType } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const newUser = {
        name,
        email,
        password,
        userType
      };
      
      const res = await axios.post('/api/users/register', newUser);
      
      // Show verification alert
      alert("✅ Registered! Check your email to verify your account.");
      
      // Set token to local storage
      localStorage.setItem('token', res.data.token);
      
      // Store verification status (false for new registrations)
      setUserVerification(false);
      
      // Set auth token for axios requests
      setAuthToken(res.data.token);
      
      // Redirect to events page
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create an Account</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
            className="form-control"
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            className="form-control"
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            className="form-control"
            placeholder="Enter a password"
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            required
            className="form-control"
            placeholder="Confirm your password"
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label>I am a...</label>
          <select
            name="userType"
            value={userType}
            onChange={onChange}
            required
            className="form-control"
          >
            <option value="guest">Guest (I attend open mics)</option>
            <option value="comedian">Comedian (I perform at open mics)</option>
            <option value="host">Host (I create and manage open mics)</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-3">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;
