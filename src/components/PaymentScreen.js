import React, { useState } from 'react';
import { Button, Card, Row, Col, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/digital-key');
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 position-relative"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        padding: '40px 20px',
      }}
    >
      {/* 🔙 Back Button */}
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

      {/* 💳 Main Card */}
      <Card
        className="p-5 text-center shadow-lg w-100"
        style={{
          border: 'none',
          borderRadius: '25px',
          maxWidth: '750px', // ✅ Increased width
          minWidth: '300px',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <h2 className="fw-bold mb-4 text-dark">💳 Complete Your Payment</h2>

        {/* 🧾 Booking Summary */}
        <div
          className="mb-4 p-4 rounded-4 shadow-sm"
          style={{ backgroundColor: '#fdfdfd', border: '1px solid #f1f1f1' }}
        >
          <h6 className="fw-semibold mb-3 text-secondary">Booking Summary</h6>
          <Row className="mb-2 small">
            <Col>Room Type & Dates</Col>
            <Col className="text-end">Standard - Oct 21–22</Col>
          </Row>
          <Row className="mb-2 small">
            <Col>Room Rate</Col>
            <Col className="text-end">$400.00</Col>
          </Row>
          <Row className="mb-2 small">
            <Col>Taxes & Fees</Col>
            <Col className="text-end">$50.00</Col>
          </Row>
          <hr className="my-2" />
          <Row className="fw-semibold small">
            <Col>Total</Col>
            <Col className="text-end text-success">$450.00</Col>
          </Row>
        </div>

        {/* 💰 Payment Methods */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3 text-secondary">Choose Payment Method</h6>
          <Row className="g-2">
            <Col>
              <Button
                variant={method === 'card' ? 'primary' : 'outline-primary'}
                className="w-100 rounded-pill fw-semibold"
                style={{
                  border: method === 'card' ? 'none' : '1px solid #E6843D',
                  backgroundColor: method === 'card' ? '#E6843D' : '#fff',
                  color: method === 'card' ? '#fff' : '#E6843D',
                }}
                onClick={() => setMethod('card')}
              >
                💳 Card
              </Button>
            </Col>
            <Col>
              <Button
                variant={method === 'wallet' ? 'primary' : 'outline-primary'}
                className="w-100 rounded-pill fw-semibold"
                style={{
                  border: method === 'wallet' ? 'none' : '1px solid #E6843D',
                  backgroundColor: method === 'wallet' ? '#E6843D' : '#fff',
                  color: method === 'wallet' ? '#fff' : '#E6843D',
                }}
                onClick={() => setMethod('wallet')}
              >
                📱 Wallet
              </Button>
            </Col>
            <Col>
              <Button
                variant={method === 'desk' ? 'primary' : 'outline-primary'}
                className="w-100 rounded-pill fw-semibold"
                style={{
                  border: method === 'desk' ? 'none' : '1px solid #E6843D',
                  backgroundColor: method === 'desk' ? '#E6843D' : '#fff',
                  color: method === 'desk' ? '#fff' : '#E6843D',
                }}
                onClick={() => setMethod('desk')}
              >
                🏢 Desk
              </Button>
            </Col>
          </Row>
        </div>

        {/* 💳 Card Form */}
        {method === 'card' && (
          <Form onSubmit={handleSubmit} className="text-start">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Card Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, number: e.target.value })
                }
                className="rounded-pill py-2 shadow-sm"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Cardholder Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, name: e.target.value })
                }
                className="rounded-pill py-2 shadow-sm"
                required
              />
            </Form.Group>

            <Row className="g-2">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">Expiry (MM/YY)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="12/25"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value })
                    }
                    className="rounded-pill py-2 shadow-sm"
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">CVV</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    className="rounded-pill py-2 shadow-sm"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="secondary"
              className="w-100 mt-3 rounded-pill fw-semibold py-2"
              style={{ border: 'none', backgroundColor: '#6c757d' }}
            >
              📷 Scan Card
            </Button>

            <Alert
              variant="light"
              className="mt-3 text-center rounded-pill py-2 small border-0 shadow-sm"
            >
              <i className="fas fa-lock me-2 text-success"></i> Secure Payment
            </Alert>

            <Button
              variant="primary"
              type="submit"
              className="w-100 rounded-pill fw-semibold py-2 mt-2 shadow-sm"
              style={{ backgroundColor: '#E6843D', border: 'none' }}
            >
              💰 Pay $450.00
            </Button>

            <p className="text-center mt-3 text-muted small mb-0">
              Need help? Please see the front desk
            </p>
          </Form>
        )}

        {/* 🏢 Pay at Desk Message */}
        {method === 'desk' && (
          <div
            className="text-center p-4 rounded-4 shadow-sm mt-4"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <h5 className="fw-semibold text-dark mb-2">Pay at the Front Desk</h5>
            <p className="text-muted small mb-0">
              Please proceed to the front desk to complete your payment. Our staff
              will be happy to assist you.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentScreen;
