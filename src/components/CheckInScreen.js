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
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 position-relative">
      {/* ✅ Back Button */}
      <Button
        variant="light"
        onClick={() => navigate(-1)}
        className="position-absolute top-0 start-0 m-3 rounded-circle shadow-sm"
        style={{
          width: '45px',
          height: '45px',
          border: 'none',
          fontSize: '1.3rem',
          fontWeight: 'bold',
        }}
      >
        ←
      </Button>

      {/* ✅ Main Card */}
      <Card
        className="p-5 text-center shadow-sm"
        style={{
          border: 'none',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px', // 🔹 increased width
          height: '520px',   // 🔹 increased height
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <h2 className="fw-bold mb-4 text-dark">Check-in</h2>
        {error && <p className="text-danger small">{error}</p>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4 text-start">
            <Form.Label className="fw-semibold">Surname</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your surname"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              className="rounded-pill py-2"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4 text-start">
            <Form.Label className="fw-semibold">Confirmation Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your confirmation name"
              value={formData.confirmationName}
              onChange={(e) => setFormData({ ...formData, confirmationName: e.target.value })}
              className="rounded-pill py-2"
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 rounded-pill fw-semibold py-2"
            style={{ backgroundColor: '#E6843D', border: 'none' }}
          >
            Proceed
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CheckInScreen;
