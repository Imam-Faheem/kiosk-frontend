import React, { useContext, useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import { ReservationContext } from "../contexts/ReservationContext";

const CheckInForm = () => {
  const navigate = useNavigate();
  const { reservationData, setReservationData } = useContext(ReservationContext);
  const [details, setDetails] = useState(reservationData.details || {});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reservationData.reservationId) {
      navigate("/new-reservation");
    }
  }, [reservationData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleProceed = () => {
    const requiredFields = ["name","email","phone","date_of_birth","address","city","zip","country","guests","purpose_of_stay","id_number"];
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

        {error && <Alert variant="danger">{error}</Alert>}

        <Card className="p-4 mb-4 border-0 rounded-4 bg-light">
          <Form>
            <Row className="g-3">
              {["name","email","phone","date_of_birth","address","city","zip","country","guests","purpose_of_stay","id_number"].map((field) => (
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
      </Card>
    </Container>
  );
};

export default CheckInForm;
