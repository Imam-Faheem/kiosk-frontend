import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const NewReservation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [corporateCode, setCorporateCode] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [overnight, setOvernight] = useState(false);
  const [bedroom, setBedroom] = useState('Any');
  const [direct, setDirect] = useState('Any');
  const [arrivalDate, setArrivalDate] = useState(new Date('2025-10-21'));
  const [departureDate, setDepartureDate] = useState(new Date('2025-10-22'));

  const handleSearchOffers = () => {
    const data = {
      searchQuery,
      adults,
      children,
      corporateCode,
      promoCode,
      overnight,
      bedroom,
      direct,
      arrivalDate,
      departureDate,
    };
    console.log('Search Data:', data);
    alert('Search clicked! Check console for values.');
  };

  return (
    <div className="container py-4">
      {/* Header with Search */}
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Create new reservation</h1>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search properties or reservations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded"
            />
            <Button variant="primary" onClick={handleSearchOffers}>
              Search
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Property & Travel Dates */}
      <Card className="p-3 mb-4 shadow-sm rounded">
        <h5 className="mb-3 fw-bold">Property and travel dates</h5>

        <Row className="mb-3 g-3">
          <Col md={3}>
            <Form.Label>Filter by property</Form.Label>
            <Form.Select className="form-control rounded">
              <option>Select property</option>
              <option>Property 1</option>
              <option>Property 2</option>
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Arrival - Departure</Form.Label>
            <div className="d-flex gap-2">
              <DatePicker
                selected={arrivalDate}
                onChange={(date) => setArrivalDate(date)}
                selectsStart
                startDate={arrivalDate}
                endDate={departureDate}
                className="form-control rounded"
                dateFormat="yyyy-MM-dd"
              />
              <DatePicker
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                selectsEnd
                startDate={arrivalDate}
                endDate={departureDate}
                minDate={arrivalDate}
                className="form-control rounded"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </Col>

          <Col md={2}>
            <Form.Label>Adults *</Form.Label>
            <Form.Control
              type="number"
              value={adults}
              min={1}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="rounded"
            />
          </Col>

          <Col md={2}>
            <Form.Label>Children</Form.Label>
            <Form.Control
              type="number"
              value={children}
              min={0}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="rounded"
            />
          </Col>
        </Row>

        {/* Codes */}
        <Row className="g-3">
          <Col md={3}>
            <Form.Label>Corporate code</Form.Label>
            <Form.Control
              type="text"
              value={corporateCode}
              onChange={(e) => setCorporateCode(e.target.value)}
              className="rounded"
            />
          </Col>
          <Col md={3}>
            <Form.Label>Promo code</Form.Label>
            <Form.Control
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="rounded"
            />
          </Col>
        </Row>
      </Card>

      {/* Accommodation Preferences */}
      <Card className="p-3 mb-4 shadow-sm rounded">
        <h5 className="mb-3 fw-bold">Accommodation Preferences</h5>
        <div className="d-flex flex-wrap gap-2">
          <Button
            variant={overnight ? 'primary' : 'outline-secondary'}
            className="rounded-pill"
            onClick={() => setOvernight(!overnight)}
          >
            Over night
          </Button>

          <Form.Select
            value={bedroom}
            onChange={(e) => setBedroom(e.target.value)}
            className="rounded-pill"
            style={{ width: 'auto' }}
          >
            <option>Any</option>
            <option>1</option>
            <option>2</option>
          </Form.Select>

          <Form.Select
            value={direct}
            onChange={(e) => setDirect(e.target.value)}
            className="rounded-pill"
            style={{ width: 'auto' }}
          >
            <option>Any</option>
            <option>Yes</option>
            <option>No</option>
          </Form.Select>
        </div>
      </Card>

      {/* Search Button */}
                <Button
        variant="secondary"
        className="rounded-pill"
        style={{
            backgroundColor: '#f3f4f6', 
            color: '#374151',           
            border: '1px solid #d1d5db',
            boxShadow: 'none',
        }}
        onMouseEnter={(e) => e.preventDefault()} 
        onMouseLeave={(e) => e.preventDefault()} 
        onClick={handleSearchOffers}
        >
        Search offers
        </Button>


    </div>
  );
};

export default NewReservation;
