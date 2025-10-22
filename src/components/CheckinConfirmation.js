import React from 'react';
import { Alert, Button, Accordion, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CheckinConfirmation = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('0');

  return (
    <Card className="kiosk-card">
      <Card.Body>
        <Alert variant="success" className="text-center">
          <div className="success-check">
            <i className="fas fa-check"></i>
          </div>
          <h1>Your Digital Key is Ready!</h1>
          <p>Your room is ready. Use any of the methods below to unlock your door.</p>
        </Alert>
        <div className="key-box mb-4">
          <i className="fas fa-key" style={{ fontSize: '4rem', color: '#4A90E2' }}></i>
        </div>
        <Accordion activeKey={activeKey} onSelect={setActiveKey}>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <i className="fas fa-mobile-alt me-2"></i> Mobile App
            </Accordion.Header>
            <Accordion.Body>
              <p>Download or open the UNO HOTELS app to access your digital key.</p>
              <Button variant="primary" className="w-100">Open In App <i className="fas fa-external-link-alt"></i></Button>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <i className="fas fa-qrcode me-2"></i> QR Code
            </Accordion.Header>
            <Accordion.Body>
              <p>Scan the QR code at the door lock.</p>
              <Button variant="secondary" className="w-100">Generate QR Code</Button>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              <i className="fas fa-wave-square me-2"></i> NFC
            </Accordion.Header>
            <Accordion.Body>
              <p>Tap your phone on the door lock for NFC access.</p>
              <Button variant="secondary" className="w-100">Activate NFC</Button>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <p className="text-center mt-4">
          <a href="#">Need Help?</a> | <a href="#">Something went wrong?</a>
        </p>
      </Card.Body>
    </Card>
  );
};

export default CheckinConfirmation;