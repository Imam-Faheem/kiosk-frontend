import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { submitForm } from '../api/api';

const OnlineCheckinForm = ({ reservationId, propertyId }) => {
  const { setState } = useAppContext();
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    guests: '1',
    purpose_of_stay: '',
    consent: false,
    id_number: '',
    signature: '',
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await submitForm({
        ...details,
        reservation_id: reservationId,
        property_id: propertyId,
      });
      setState(prev => ({ ...prev, guestInfo: details }));
      navigate('/payment');
    } catch (error) {
      setError('Sorry, there was an issue submitting your form. Please try again later or contact support.');
    }
  };

  return (
    <Card className="kiosk-card">
      <Card.Header className="text-center">Online Check-in</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} required />
              </Form.Group>
            </Col>
            <Col md= {6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} required />
              </Form.Group>
            </Col>
          </Row>
          {/* Add all other fields as per your code */}
          {/* ... (truncated for brevity, use your full code here) */}
          <Button variant="primary" type="submit" className="mt-3 w-100">Submit</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default OnlineCheckinForm;