import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isVerified } from '../../utils/auth';

const PrivateRoute = ({ children, requireVerification = true }) => {
  const location = useLocation();
  
  // Check if authenticated first
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // If verification is required and user is not verified, redirect to warning page
  if (requireVerification && !isVerified()) {
    return <Navigate to="/verify-warning" replace />
  }
  
  // User is authenticated and (verified or verification not required)
  return children;
};

export default PrivateRoute;
