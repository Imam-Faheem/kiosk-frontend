import React, { useState } from 'react';
import { Alert, Accordion, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CheckinConfirmation = () => {
  const [activeKey, setActiveKey] = useState('0');
  const navigate = useNavigate();

  // 🔙 Go back dynamically
  const handleBack = () => navigate(-1);

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100 bg-light"
      style={{ overflow: 'hidden' }}
    >
      <div
        className="p-5 text-center"
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0px 6px 20px rgba(0,0,0,0.1)',
          maxWidth: '550px',
          width: '100%',
        }}
      >
        {/* ✅ Success Message */}
        <Alert variant="success" className="text-center border-0 mb-4 shadow-sm p-4">
          <div
            className="d-flex justify-content-center align-items-center mb-3"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              margin: '0 auto',
            }}
          >
            <i className="fas fa-check text-white" style={{ fontSize: '2.5rem' }}></i>
          </div>
          <h2 className="fw-bold text-success mb-2">Your Digital Key is Ready!</h2>
          <p className="text-muted mb-0">
            Your room is ready. Use any method below to unlock your door.
          </p>
        </Alert>

        {/* 🔑 Key Icon */}
        <div className="mb-4">
          <i className="fas fa-key" style={{ fontSize: '3.5rem', color: '#007BFF' }}></i>
        </div>

        {/* Accordion */}
        <Accordion activeKey={activeKey} onSelect={setActiveKey} className="text-start mb-4">
          <Accordion.Item eventKey="0" className="border-0 shadow-sm mb-3 rounded">
            <Accordion.Header>
              <i className="fas fa-mobile-alt me-2 text-primary"></i> Mobile App
            </Accordion.Header>
            <Accordion.Body>
              <p>Download or open the UNO HOTELS app to access your digital key.</p>
              <Button variant="primary" className="w-100">
                Open in App <i className="fas fa-external-link-alt ms-2"></i>
              </Button>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className="border-0 shadow-sm mb-3 rounded">
            <Accordion.Header>
              <i className="fas fa-qrcode me-2 text-primary"></i> QR Code
            </Accordion.Header>
            <Accordion.Body>
              <p>Scan the QR code at the door lock.</p>
              <Button variant="outline-primary" className="w-100">
                Generate QR Code
              </Button>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2" className="border-0 shadow-sm rounded">
            <Accordion.Header>
              <i className="fas fa-wave-square me-2 text-primary"></i> NFC
            </Accordion.Header>
            <Accordion.Body>
              <p>Tap your phone on the door lock for NFC access.</p>
              <Button variant="outline-primary" className="w-100">
                Activate NFC
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Footer */}
        <p className="text-center mt-3 mb-4 text-muted">
          <a href="#" className="text-decoration-none me-2">Need Help?</a> |
          <a href="#" className="text-decoration-none ms-2">Something went wrong?</a>
        </p>

        {/* 🔙 Back Button */}
        <Button variant="secondary" onClick={handleBack} className="w-50 mx-auto d-block">
          <i className="fas fa-arrow-left me-2"></i> Back
        </Button>
      </div>
    </Container>
  );
};

export default CheckinConfirmation;
