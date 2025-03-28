import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setUserVerification } from '../utils/auth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('❌ Invalid verification link');
      return;
    }

    const verify = async () => {
      console.log('🚀 Sending verification request...');
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/verify-email?token=${token}`
        );
        console.log('✅ Got response back:', data);
        setUserVerification(true);
        setStatus('success');
        setMessage(data.message || '✅ Email verified successfully!');
        console.log('🧠 Message being set:', data.message);
        // clear old token and user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        console.error('❌ Verification error:', err);
        setStatus('error');
        if (err?.response?.data?.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage('❌ Verification failed. Please try again.');
        }
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>
        {status === 'verifying'
          ? 'Verifying...'
          : status === 'success'
          ? '✅ Success!'
          : 'Verification Failed'}
      </h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
