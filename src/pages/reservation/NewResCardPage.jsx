import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const NewResCardPage = () => {
  const location = useLocation();
  const { room, searchCriteria, guestDetails, savedGuest } = location.state ?? {};

  if (room && guestDetails) {
    return (
      <Navigate
        to="/reservation/payment"
        replace
        state={{
          room,
          searchCriteria,
          guestDetails,
          savedGuest,
        }}
      />
    );
  }

  return <Navigate to="/reservation/search" replace />;
};

export default NewResCardPage;
