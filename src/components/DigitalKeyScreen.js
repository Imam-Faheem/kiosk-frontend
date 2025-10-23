import React, { useState } from 'react';
import { Alert, Accordion, Button, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DigitalKeyScreen = () => {
  const [activeKey, setActiveKey] = useState('0');
  const [digitalKey, setDigitalKey] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  // Generate 4–6 digit key
  const handleGenerateKey = () => {
    const randomKey = Math.floor(1000 + Math.random() * 900000).toString();
    setDigitalKey(randomKey);
  };

  const handleSendEmail = () => {
    alert(`📧 Email sent to: ${email}\n\nMessage:\n${message}`);
  };

  const handleSendMessage = () => {
    alert(`💬 Message sent:\n\n${message}`);
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ overflow: 'hidden', backgroundColor: '#fff' }}
    >
      <style>{`
        @keyframes blinkKey {
          0%, 100% { opacity: 1; color: #FFA726; }
          50% { opacity: 0.5; color: #FFB84D; }
        }
        .blink-icon {
          animation: blinkKey 1.2s infinite;
        }
        .btn-orange {
          background-color: #FFA726;
          border: none;
          color: white;
          border-radius: 40px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .btn-orange:hover {
          background-color: #FF9800;
          transform: scale(1.03);
        }
        .btn-outline-orange {
          border: 2px solid #FFA726;
          color: #FFA726;
          border-radius: 40px;
          transition: all 0.3s ease;
        }
        .btn-outline-orange:hover {
          background-color: #FFA726;
          color: white;
          transform: scale(1.03);
        }
        .link-button {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          color: #0d6efd;
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>

      <div
        className="p-5 text-center"
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.1)',
          maxWidth: '650px',
          width: '100%',
        }}
      >
        {/* ✅ Success Section */}
        <Alert variant="success" className="border-0 shadow-sm p-4 mb-4">
          <div
            className="d-flex justify-content-center align-items-center mb-3"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: '#28a745',
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

        {/* 🔑 Blinking Key Icon */}
        <div className="mb-4">
          <i className="fas fa-key blink-icon" style={{ fontSize: '3.5rem' }}></i>
        </div>

        {/* 📱 Accordion Options */}
        <Accordion activeKey={activeKey} onSelect={setActiveKey} className="text-start mb-4">
          {/* Mobile App */}
          <Accordion.Item eventKey="0" className="border-0 shadow-sm mb-3 rounded">
            <Accordion.Header>
              <i className="fas fa-mobile-alt me-2 text-warning"></i> Mobile App
            </Accordion.Header>
            <Accordion.Body>
              <p>Download or open the UNO HOTELS app to access your digital key.</p>
              <Button className="w-100 btn-orange">
                Open in App <i className="fas fa-external-link-alt ms-2"></i>
              </Button>
            </Accordion.Body>
          </Accordion.Item>

          {/* QR Code */}
          <Accordion.Item eventKey="1" className="border-0 shadow-sm mb-3 rounded">
            <Accordion.Header>
              <i className="fas fa-qrcode me-2 text-warning"></i> QR Code
            </Accordion.Header>
            <Accordion.Body>
              <p>Scan the QR code at the door lock or generate your key.</p>
              <Button onClick={handleGenerateKey} className="w-100 btn-outline-orange">
                Generate Digital Key
              </Button>
              {digitalKey && (
                <div
                  className="mt-3 p-3 text-center border rounded"
                  style={{
                    borderColor: '#FFA726',
                    color: '#FFA726',
                    backgroundColor: '#FFF8F0',
                    fontWeight: '600',
                    fontSize: '1.5rem',
                    letterSpacing: '3px',
                    borderRadius: '12px',
                  }}
                >
                  {digitalKey}
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* NFC */}
          <Accordion.Item eventKey="2" className="border-0 shadow-sm mb-3 rounded">
            <Accordion.Header>
              <i className="fas fa-wave-square me-2 text-warning"></i> NFC
            </Accordion.Header>
            <Accordion.Body>
              <p>Tap your phone on the door lock for NFC access.</p>
              <Button className="w-100 btn-outline-orange">Activate NFC</Button>
            </Accordion.Body>
          </Accordion.Item>

          {/* Email / Message */}
          <Accordion.Item eventKey="3" className="border-0 shadow-sm rounded">
            <Accordion.Header>
              <i className="fas fa-envelope me-2 text-warning"></i> Email / Message
            </Accordion.Header>
            <Accordion.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button className="flex-fill btn-orange" onClick={handleSendEmail}>
                    Send Email
                  </Button>
                  <Button className="flex-fill btn-outline-orange" onClick={handleSendMessage}>
                    Send Message
                  </Button>
                </div>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* 🔗 Footer Links as Buttons */}
        <div className="text-center mt-3 mb-4 text-muted">
          <button className="link-button me-2" onClick={() => alert('Need Help clicked')}>
            Need Help?
          </button>
          |
          <button className="link-button ms-2" onClick={() => alert('Something went wrong clicked')}>
            Something went wrong?
          </button>
        </div>

        {/* 🔙 Back Button */}
        <Button
          variant="light"
          onClick={handleBack}
          className="w-50 mx-auto d-block btn-outline-orange"
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </Button>
      </div>
    </Container>
  );
};

export default DigitalKeyScreen;
