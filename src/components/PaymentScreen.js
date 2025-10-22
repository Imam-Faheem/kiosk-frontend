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
    <Card className="kiosk-card p-2 text-center" style={{ maxWidth: '350px', margin: '0 auto' }}>
      <h2>Complete Your Payment</h2>
      <Card className="mb-3" style={{ padding: '0.5rem' }}>
        <Card.Header>Your Booking Summary</Card.Header>
        <Card.Body>
          <Row className="mb-1"><Col>Room Type & Dates</Col><Col className="text-end">Standard - Oct 21-22</Col></Row>
          <Row className="mb-1"><Col>Room Rate</Col><Col className="text-end">$400.00</Col></Row>
          <Row className="mb-1"><Col>Taxes & Fees</Col><Col className="text-end">$50.00</Col></Row>
          <Row><Col><strong>Total Amount</strong></Col><Col className="text-end"><strong>$450.00</strong></Col></Row>
        </Card.Body>
      </Card>
      <Card className="mb-3" style={{ padding: '0.5rem' }}>
        <Card.Header>Choose Payment Method</Card.Header>
        <Card.Body>
          <Row className="g-2">
            <Col><Button variant={method === 'card' ? 'primary' : 'outline-primary'} className="w-100" onClick={() => setMethod('card')} style={{ padding: '0.3rem' }}>Credit/Debit Card</Button></Col>
            <Col><Button variant={method === 'wallet' ? 'primary' : 'outline-primary'} className="w-100" onClick={() => setMethod('wallet')} style={{ padding: '0.3rem' }}>Mobile Wallet</Button></Col>
            <Col><Button variant={method === 'desk' ? 'primary' : 'outline-primary'} className="w-100" onClick={() => setMethod('desk')} style={{ padding: '0.3rem' }}>Pay at Desk</Button></Col>
          </Row>
        </Card.Body>
      </Card>
      {method === 'card' && (
        <Form onSubmit={handleSubmit} style={{ maxWidth: '300px', margin: '0 auto' }}>
          <Form.Group className="mb-2">
            <Form.Label>Card Number</Form.Label>
            <Form.Control type="text" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Cardholder Name</Form.Label>
            <Form.Control type="text" value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })} required />
          </Form.Group>
          <Row className="g-2">
            <Col><Form.Group><Form.Label>Expiration Date (MM/YY)</Form.Label><Form.Control type="text" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} required /></Form.Group></Col>
            <Col><Form.Group><Form.Label>CVV</Form.Label><Form.Control type="text" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} required /></Form.Group></Col>
          </Row>
          <Button variant="secondary" className="w-100 mt-2" style={{ padding: '0.3rem' }}>Scan Card</Button>
          <Alert variant="info" className="mt-2 text-center" style={{ fontSize: '0.9rem' }}><i className="fas fa-lock me-2"></i> Secure Payment</Alert>
          <Button variant="primary" type="submit" className="w-100 accent-button mt-2" style={{ padding: '0.3rem' }}>Pay $450.00</Button>
          <p className="text-center mt-2 text-muted" style={{ fontSize: '0.8rem' }}>Need help? Please see the front desk</p>
        </Form>
      )}
      {method === 'desk' && <p className="text-center" style={{ fontSize: '0.9rem' }}>Please proceed to the front desk for payment.</p>}
    </Card>
  );
};

export default PaymentScreen;