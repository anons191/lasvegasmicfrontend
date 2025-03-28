import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const VerifyWarning = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    setSending(true);
    setError('');
    
    try {
      await axios.post('/api/users/resend-verification');
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card border-warning">
        <div className="card-header bg-warning text-white">
          <h2 className="mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Account Verification Required
          </h2>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h4>Your account is currently in read-only mode</h4>
              <p className="lead">
                We've sent a verification email to your registered email address. 
                Please check your inbox (and spam folder) for an email with the subject 
                "Verify Your Open Mic App Account".
              </p>
              
              <h5 className="mt-4">What can I do now?</h5>
              <ul>
                <li>You can <strong>browse events</strong> and view the event map.</li>
                <li>You can view <strong>public profiles</strong> of other users.</li>
                <li className="text-muted">You <strong>cannot create or edit</strong> events, performances, or profile information.</li>
              </ul>
              
              <h5 className="mt-4">Why verification?</h5>
              <p>
                Email verification helps us ensure that all accounts on the platform are created 
                by real people with valid email addresses. This reduces spam and helps maintain 
                the quality of our community.
              </p>
              
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              
              {sent ? (
                <div className="alert alert-success mt-3">
                  ✅ Verification email sent! Please check your inbox.
                </div>
              ) : (
                <button 
                  className="btn btn-primary mt-3" 
                  onClick={handleResendEmail}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
              
              <div className="mt-4">
                <Link to="/" className="btn btn-outline-secondary">
                  Return to Events
                </Link>
              </div>
            </div>
            
            <div className="col-md-4 mt-3 mt-md-0">
              <div className="card bg-light">
                <div className="card-body">
                  <h5>Troubleshooting</h5>
                  <hr />
                  <p><strong>No email received?</strong></p>
                  <ul className="small">
                    <li>Check your spam/junk folder</li>
                    <li>Use the "Resend" button</li>
                    <li>Make sure you entered the correct email address</li>
                  </ul>
                  <hr />
                  <p><strong>Wrong email address?</strong></p>
                  <p className="small">
                    If you accidentally registered with the wrong email, please logout 
                    and create a new account with the correct email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyWarning;