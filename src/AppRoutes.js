import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Language from './pages/Language';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Payment from './pages/Payment';
import DigitalKey from './pages/DigitalKey';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Feedback from './pages/Feedback';
import NewReservation from './pages/NewReservation'; 

const AppRoutes = () => {
  return (
    <Routes>
      {/* Initial flow */}
      <Route path="/" element={<Language />} />
      <Route path="/home" element={<Home />} />
      <Route path="/checkin" element={<CheckIn />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/digital-key" element={<DigitalKey />} />
      <Route path="/lost-card" element={<div><h2>Lost Card</h2><p>Please contact the front desk.</p></div>} />

      {/* Checkout flow */}
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/new-reservation" element={<NewReservation />} />

      {/* Default / fallback */}
      <Route path="*" element={<Language />} />
    </Routes>
  );
};

export default AppRoutes;
