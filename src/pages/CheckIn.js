import React, { useContext } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useReservationContext } from "../contexts/ReservationContext";
import { ArrowLeft } from "react-bootstrap-icons";

const CheckIn = () => {
  const navigate = useNavigate();
  const { reservationData } = useReservationContext();

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: "#f8f9fa", padding: "30px" }}
    >
      <Card className="p-5 border-0 shadow-lg rounded-4 w-100" style={{ maxWidth: "1000px", backgroundColor: "#fff" }}>
        <div className="relative mb-3">
          <Button
            onClick={() => navigate(-1)}
            style={{ backgroundColor: "#6c757d", border: "none", color: "#fff", borderRadius: "9999px" }}
            title="Back"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>
        <h2>Check-In</h2>
        {reservationData?.reservationId ? (
          <div>
            <p>Reservation ID: {reservationData.reservationId}</p>
            <p>Property ID: {reservationData.propertyId}</p>
            <p>Arrival: {reservationData.details.arrival}</p>
            <p>Departure: {reservationData.details.departure}</p>
            <p>Adults: {reservationData.details.adults}</p>
            <p>Children: {reservationData.details.children}</p>
            <Button variant="primary" onClick={() => navigate("/signature-consent")}>
              Proceed to Signature Consent
            </Button>
          </div>
        ) : (
          <p>No reservation data available. Please create a reservation first.</p>
        )}
      </Card>
    </Container>
  );
};

export default CheckIn;