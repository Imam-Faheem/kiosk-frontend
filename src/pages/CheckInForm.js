import React, { useContext, useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import { ReservationContext } from "../contexts/ReservationContext";
import axios from "axios";

const CheckInForm = () => {
  const navigate = useNavigate();
  const { reservationData, setReservationData } = useContext(ReservationContext);
  const [details, setDetails] = useState(reservationData.details || {});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data from Apaleo global URL
  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationData.reservationId) return;

      setLoading(true);
      setError(null);

      try {
        const resId = reservationData.reservationId;
        const propertyId = reservationData.propertyId;
        const url = `https://unohotels.de/confirmation?resId=${resId}&propertyId=${propertyId}`;

        // Fetching the reservation details
        const response = await axios.get(url);

        // Assume the API returns JSON with relevant reservation details
        if (response.data) {
          setDetails(response.data);
          setReservationData({ ...reservationData, details: response.data });
        } else {
          setError("No reservation data returned from server.");
        }
      } catch (err) {
        console.error("Error fetching reservation:", err);
        setError("Failed to fetch reservation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationData.reservationId, reservationData.propertyId, setReservationData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceed = () => {
    const requiredFields = [
      "name","email","phone","date_of_birth","address","city","zip",
      "country","guests","purpose_of_stay","id_number"
    ];
    for (const field of requiredFields) {
      if (!details[field]) {
        setError(`Please fill in ${field.replace("_"," ")}`);
        return;
      }
    }
    setReservationData({ ...reservationData, details });
    navigate("/signature-consent");
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#F9F1E9", padding: "30px" }}>
      <Card className="p-5 border-0 shadow-lg rounded-4 w-100" style={{ maxWidth: "1000px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="light" onClick={() => navigate("/new-reservation")}><ArrowLeft /></Button>
          <h2 className="fw-bold text-center flex-grow-1 mb-0 text-dark">✍️ Online Check-in</h2>
        </div>

        {loading && <Spinner animation="border" variant="primary" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && (
          <Card className="p-4 mb-4 border-0 rounded-4 bg-light">
            <Form>
              <Row className="g-3">
                {[
                  "name","email","phone","date_of_birth","address","city","zip",
                  "country","guests","purpose_of_stay","id_number"
                ].map((field) => (
                  <Col md={6} key={field}>
                    <Form.Group>
                      <Form.Label>{field.replace("_"," ").toUpperCase()} *</Form.Label>
                      <Form.Control
                        type={field==="date_of_birth"?"date":"text"}
                        name={field}
                        value={details[field] || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
              <div className="text-center mt-4">
                <Button onClick={handleProceed} className="rounded-pill px-5 py-2" style={{ backgroundColor: "#E6843D", border: "none", color: "#fff" }}>
                  Proceed to Signature
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </Card>
    </Container>
  );
};

export default CheckInForm;
