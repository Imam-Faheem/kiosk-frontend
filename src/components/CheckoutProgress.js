import React from 'react';
import { ProgressBar } from 'react-bootstrap';

const CheckoutProgress = ({ step }) => {
  const steps = ['Select Room', 'Enter Details', 'Confirm'];
  return (
    <ProgressBar now={(step / (steps.length - 1)) * 100} label={steps[step]} className="mb-3" />
  );
};

export default CheckoutProgress;