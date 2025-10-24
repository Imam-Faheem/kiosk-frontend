import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { DatesProvider } from "@mantine/dates";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "./contexts/AppContext";
import { ReservationProvider } from "./contexts/ReservationContext";
import AppRoutes from "./AppRoutes";
import { theme } from "./config/theme";
import "dayjs/locale/en";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <DatesProvider settings={{ firstDayOfWeek: 0, locale: "en" }}>
            <Notifications position="top-right" />
            <ModalsProvider>
              <AppContextProvider>
                <ReservationProvider>
                  {showWelcome ? (
                    <div className="welcome-screen d-flex justify-content-center align-items-center vh-100">
                      <h1 className="welcome-text">
                        Welcome to <span>UNO HOTELS</span>
                      </h1>
                    </div>
                  ) : (
                    <AppRoutes />
                  )}
                </ReservationProvider>
              </AppContextProvider>
            </ModalsProvider>
          </DatesProvider>
        </MantineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
