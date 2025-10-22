import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { submitForm } from '../api/api';

const ConfirmationForm = ({ onSubmit, reservationId, propertyId }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitForm({
        ...details,
        reservation_id: reservationId,
        property_id: propertyId,
      });
      onSubmit(details);
    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Sorry, there was an issue submitting your form. Please try again later or contact support.');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} required />
      </Form.Group>
      <Form.Group controlId="email" className="mt-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} required />
      </Form.Group>
      <Form.Group controlId="phone" className="mt-3">
        <Form.Label>Phone</Form.Label>
        <Form.Control type="tel" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} required />
      </Form.Group>
      <Form.Group controlId="date_of_birth" className="mt-3">
        <Form.Label>Date of Birth</Form.Label>
        <Form.Control type="date" value={details.date_of_birth} onChange={(e) => setDetails({ ...details, date_of_birth: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="address" className="mt-3">
        <Form.Label>Address</Form.Label>
        <Form.Control type="text" value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} required />
      </Form.Group>
      <Form.Group controlId="city" className="mt-3">
        <Form.Label>City</Form.Label>
        <Form.Control type="text" value={details.city} onChange={(e) => setDetails({ ...details, city: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="zip" className="mt-3">
        <Form.Label>ZIP</Form.Label>
        <Form.Control type="text" value={details.zip} onChange={(e) => setDetails({ ...details, zip: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="country" className="mt-3">
        <Form.Label>Country</Form.Label>
        <Form.Control type="text" value={details.country} onChange={(e) => setDetails({ ...details, country: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="guests" className="mt-3">
        <Form.Label>Guests</Form.Label>
        <Form.Control type="number" min="1" value={details.guests} onChange={(e) => setDetails({ ...details, guests: e.target.value })} required />
      </Form.Group>
      <Form.Group controlId="purpose_of_stay" className="mt-3">
        <Form.Label>Purpose of Stay</Form.Label>
        <Form.Control type="text" value={details.purpose_of_stay} onChange={(e) => setDetails({ ...details, purpose_of_stay: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="consent" className="mt-3">
        <Form.Check type="checkbox" label="Consent" checked={details.consent} onChange={(e) => setDetails({ ...details, consent: e.target.checked })} required />
      </Form.Group>
      <Form.Group controlId="id_number" className="mt-3">
        <Form.Label>ID Number</Form.Label>
        <Form.Control type="text" value={details.id_number} onChange={(e) => setDetails({ ...details, id_number: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="signature" className="mt-3">
        <Form.Label>Signature</Form.Label>
        <Form.Control type="text" value={details.signature} onChange={(e) => setDetails({ ...details, signature: e.target.value })} required />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">Submit</Button>
    </Form>
  );
};

export default ConfirmationForm;