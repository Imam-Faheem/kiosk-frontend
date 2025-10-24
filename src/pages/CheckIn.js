import React, { useContext, useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import axios from "axios";

const CheckIn = () => {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reservationData = {
    reservationId: "HDKLRXEQ-1",
    propertyId: "STERN",
  };

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      setError(null);

      const resId = reservationData?.reservationId || "HDKLRXEQ-1";
      const propId = reservationData?.propertyId || "STERN";
      const url = `https://unohotels.de/confirmation?resId=${resId}&propertyId=${propId}`;

      try {
        const response = await axios.get(url);
        // Extract only useful data
        const relevantData = {
          reservationId: resId,
          propertyId: propId,
          guestName: response.data?.guestName || "-",
          arrival: response.data?.arrival || "-",
          departure: response.data?.departure || "-",
          adults: response.data?.adults || "-",
          children: response.data?.children || "-",
        };
        setApiData(relevantData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reservation:", err);
        setError("Failed to fetch reservation data.");
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationData]);

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: "#f8f9fa", padding: "30px" }}
    >
      <Card
        className="p-5 border-0 shadow-lg rounded-4 w-100"
        style={{ maxWidth: "1000px", backgroundColor: "#fff" }}
      >
        <div className="relative mb-3">
          <Button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: "#6c757d",
              border: "none",
              color: "#fff",
              borderRadius: "9999px",
            }}
            title="Back"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>

        <h2 className="mb-4">✍️ Online Check-In</h2>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Fetching reservation details...</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {apiData && (
          <div>
            <p>
              <strong>Reservation ID:</strong> {apiData.reservationId}
            </p>
            <p>
              <strong>Property ID:</strong> {apiData.propertyId}
            </p>
            <p>
              <strong>Guest Name:</strong> {apiData.guestName}
            </p>
            <p>
              <strong>Arrival:</strong> {apiData.arrival}
            </p>
            <p>
              <strong>Departure:</strong> {apiData.departure}
            </p>
            <p>
              <strong>Adults:</strong> {apiData.adults}
            </p>
            <p>
              <strong>Children:</strong> {apiData.children}
            </p>

            <div className="text-center mt-4">
              <Button
                variant="primary"
                className="rounded-pill px-5 py-2"
                style={{ backgroundColor: "#E6843D", border: "none" }}
                onClick={() => navigate("/signature-consent")}
              >
                Proceed to Signature Consent
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default CheckIn;
