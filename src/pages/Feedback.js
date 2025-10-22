import React from 'react';
import Header from '../components/Header';
import FeedbackForm from '../components/FeedbackForm';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'; // Add this import

const Feedback = () => {
  const navigate = useNavigate();
  const reservationId = localStorage.getItem('reservationId') || '';

  return (
    <div>
      <Header />
      <FeedbackForm reservationId={reservationId} />
      <Button variant="secondary" onClick={() => navigate('/confirmation')}>Back</Button> {/* This now works */}
    </div>
  );
};

export default Feedback;