import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UNOLanguageSelector from "./components/UNOLanguageSelector";
import UNOHome from "./components/UNOHome";
import Login from "./pages/Login";
import NewReservation from "./pages/NewReservation";
import CheckIn from "./pages/CheckIn";
import SignatureConsent from "./pages/SignatureConsent";
import Payment from "./pages/Payment";
import DigitalKey from "./pages/DigitalKey";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import Feedback from "./pages/Feedback";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UNOLanguageSelector />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><UNOHome /></ProtectedRoute>} />
      <Route path="/new-reservation" element={<ProtectedRoute><NewReservation /></ProtectedRoute>} />
      <Route path="/check-in" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
      <Route path="/signature-consent" element={<ProtectedRoute><SignatureConsent /></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/digital-key" element={<ProtectedRoute><DigitalKey /></ProtectedRoute>} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;