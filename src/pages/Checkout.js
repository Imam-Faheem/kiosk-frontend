import React from 'react';
import OnlineCheckinForm from '../components/OnlineCheckinForm';

const Checkout = () => {
  const reservationId = 'RES' + Date.now(); // Mock reservation ID
  const propertyId = 'UNO001'; // Mock property ID
  return <OnlineCheckinForm reservationId={reservationId} propertyId={propertyId} />;
};

export default Checkout;