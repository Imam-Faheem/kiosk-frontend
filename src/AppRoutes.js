import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, Loader } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './config/theme';
import './config/i18n';

// Import new kiosk pages
import WelcomePage from "./pages/WelcomePage";
import MainMenuPage from "./pages/MainMenuPage";
import ErrorPage from "./pages/ErrorPage";
import PropertySelectionPage from "./pages/PropertySelectionPage";

// Check-in flow pages
import CheckInPage from "./pages/checkin/CheckInPage";
import PaymentCheckPage from "./pages/checkin/PaymentCheckPage";
import PaymentTerminalPage from "./pages/checkin/PaymentTerminalPage";
import CardDispensingPage from "./pages/checkin/CardDispensingPage";
import CheckInCompletePage from "./pages/checkin/CheckInCompletePage";

// Reservation flow pages
import SearchRoomsPage from "./pages/reservation/SearchRoomsPage";
import GuestDetailsPage from "./pages/reservation/GuestDetailsPage";
import RoomDetailPage from "./pages/reservation/RoomDetailPage";
import SignaturePage from "./pages/reservation/SignaturePage";
import NewResPaymentPage from "./pages/reservation/NewResPaymentPage";
import NewResCardPage from "./pages/reservation/NewResCardPage";
import ReservationCompletePage from "./pages/reservation/ReservationCompletePage";

// Lost card flow pages
import LostCardPage from "./pages/lostcard/LostCardPage";
import RegenerateCardPage from "./pages/lostcard/RegenerateCardPage";
import CardIssuedPage from "./pages/lostcard/CardIssuedPage";

// Shared pages
import EarlyArrivalPage from "./pages/shared/EarlyArrivalPage";

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0,
    },
  },
});

// Loading component for Suspense
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#FFFFFF'
  }}>
    <Loader size="lg" color="#C8653D" />
  </div>
);

const AppRoutes = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Main kiosk flow */}
          <Route path="/" element={<PropertySelectionPage />} />
          <Route path="/property-setup" element={<PropertySelectionPage />} />
          <Route path="/property-selector" element={<PropertySelectionPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/home" element={<MainMenuPage />} />
          
          {/* Check-in flow */}
          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="/checkin/payment-check" element={<PaymentCheckPage />} />
          <Route path="/checkin/payment" element={<PaymentTerminalPage />} />
          <Route path="/checkin/card-dispensing" element={<CardDispensingPage />} />
          <Route path="/checkin/complete" element={<CheckInCompletePage />} />
          <Route path="/checkin/early-arrival" element={<EarlyArrivalPage />} />
          
          {/* New reservation flow */}
          <Route path="/reservation/search" element={<SearchRoomsPage />} />
          <Route path="/reservation/guest-details" element={<GuestDetailsPage />} />
          <Route path="/reservation/room-details" element={<RoomDetailPage />} />
          <Route path="/reservation/signature" element={<SignaturePage />} />
          <Route path="/reservation/payment" element={<NewResPaymentPage />} />
          <Route path="/reservation/card" element={<NewResCardPage />} />
          <Route path="/reservation/complete" element={<ReservationCompletePage />} />
          <Route path="/reservation/early-arrival" element={<EarlyArrivalPage />} />
          
          {/* Lost card flow */}
          <Route path="/lost-card" element={<LostCardPage />} />
          <Route path="/lost-card/regenerate" element={<RegenerateCardPage />} />
          <Route path="/lost-card/issued" element={<CardIssuedPage />} />
          <Route path="/lost-card/early-arrival" element={<EarlyArrivalPage />} />
          
          {/* Error page */}
          <Route path="/error" element={<ErrorPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default AppRoutes;