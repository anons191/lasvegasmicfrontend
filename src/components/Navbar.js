import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout, isVerified } from '../utils/auth';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [verified, setVerified] = useState(isVerified());
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setVerified(isVerified()); // 🧠 <-- Refresh verified state too
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUser();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isAuthenticated() && !verified && (
        <div className="alert alert-warning text-center mb-0" style={{ borderRadius: 0 }}>
          ⚠️ Your account is not verified. Please check your email to activate full access.
          <button 
            className="btn btn-sm btn-outline-dark ms-3"
            onClick={() => window.location.href = '/verify-warning'}
          >
            Learn More
          </button>
        </div>
      )}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Open Mic App
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Events
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/map">
                Map
              </Link>
            </li>
            {user && user.userType === 'host' && (
              <li className="nav-item">
                <Link className="nav-link" to="/create-event">
                  Create Event
                </Link>
              </li>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {isAuthenticated() ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link btn btn-link" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
