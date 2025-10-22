import React, { useState } from 'react';
import { Alert, Accordion, Card, Button } from 'react-bootstrap';

const DigitalKeyScreen = () => {
  const [activeKey, setActiveKey] = useState('0');

  return (
    <Card className="kiosk-card p-2 text-center" style={{ maxWidth: '350px', margin: '0 auto' }}>
      <Alert variant="success" style={{ padding: '0.5rem' }}>
        <div className="success-check" style={{ width: '60px', height: '60px' }}>
          <i className="fas fa-check" style={{ fontSize: '30px' }}></i>
        </div>
        <h2 style={{ fontSize: '1.5rem' }}>Your Digital Key is Ready!</h2>
        <p style={{ fontSize: '0.9rem' }}>Your room is ready. Use any of the methods below to unlock your door.</p>
      </Alert>
      <div className="key-box mb-3" style={{ padding: '10px' }}>
        <i className="fas fa-key" style={{ fontSize: '3rem', color: '#4A90E2' }}></i>
      </div>
      <Accordion activeKey={activeKey} onSelect={setActiveKey}>
        <Accordion.Item eventKey="0">
          <Accordion.Header style={{ fontSize: '0.9rem' }}><i className="fas fa-mobile-alt me-2"></i> Mobile App</Accordion.Header>
          <Accordion.Body style={{ padding: '0.5rem' }}>
            <p style={{ fontSize: '0.9rem' }}>Download or open the UNO HOTELS app to access your digital key.</p>
            <Button variant="primary" className="w-100 accent-button" style={{ padding: '0.3rem' }}>Open In App <i className="fas fa-external-link-alt"></i></Button>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header style={{ fontSize: '0.9rem' }}><i className="fas fa-qrcode me-2"></i> QR Code</Accordion.Header>
          <Accordion.Body style={{ padding: '0.5rem' }}>
            <p style={{ fontSize: '0.9rem' }}>Scan the QR code at the door lock.</p>
            <Button variant="secondary" className="w-100" style={{ padding: '0.3rem' }}>Generate QR Code</Button>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header style={{ fontSize: '0.9rem' }}><i className="fas fa-wave-square me-2"></i> NFC</Accordion.Header>
          <Accordion.Body style={{ padding: '0.5rem' }}>
            <p style={{ fontSize: '0.9rem' }}>Tap your phone on the door lock for NFC access.</p>
            <Button variant="secondary" className="w-100" style={{ padding: '0.3rem' }}>Activate NFC</Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <p className="text-center mt-3" style={{ fontSize: '0.8rem' }}>
        <a href="#">Need Help?</a> | <a href="#">Something went wrong?</a>
      </p>
    </Card>
  );
};

export default DigitalKeyScreen;