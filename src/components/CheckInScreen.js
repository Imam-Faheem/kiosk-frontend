import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const CheckInScreen = () => {
  const navigate = useNavigate();
  const { updateGuestInfo } = useAppContext();
  const [formData, setFormData] = useState({ surname: '', confirmationName: '' });
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.surname || !formData.confirmationName) {
      setError('Both fields are required.');
      return;
    }
    updateGuestInfo(formData);
    navigate('/payment');
    setError(null);
  };

  return (
    <Card className="kiosk-card p-2 text-center">
      <h2>Check-in</h2>
      {error && <p className="text-danger">{error}</p>}
      <Form onSubmit={handleSubmit} style={{ maxWidth: '300px', margin: '0 auto' }}>
        <Form.Group className="mb-2">
          <Form.Label>Surname</Form.Label>
          <Form.Control
            type="text"
            value={formData.surname}
            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Confirmation Name</Form.Label>
          <Form.Control
            type="text"
            value={formData.confirmationName}
            onChange={(e) => setFormData({ ...formData, confirmationName: e.target.value })}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="accent-button w-50 mt-2">Proceed</Button>
      </Form>
    </Card>
  );
};

export default CheckInScreen;