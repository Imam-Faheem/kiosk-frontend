import React, { createContext, useContext, useState } from "react";

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservationData, setReservationData] = useState({
    reservationId: null,
    propertyId: null,
    offers: [],
    details: {},
  });

  return (
    <ReservationContext.Provider value={{ reservationData, setReservationData }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservationContext = () => useContext(ReservationContext);
export { ReservationContext };