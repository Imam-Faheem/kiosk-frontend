import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { fetchRooms } from '../api/api';

const RoomSelection = ({ onSelect }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  return (
    <Row>
      {rooms.length > 0 ? (
        rooms.map(room => (
          <Col key={room.id} md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{room.name}</Card.Title>
                <Card.Text>Status: {room.status}</Card.Text>
                <Button variant="primary" onClick={() => onSelect(room)}>Select</Button>
              </Card.Body>
            </Card>
          </Col>
        ))
      ) : (
        <p>Loading rooms...</p>
      )}
    </Row>
  );
};

export default RoomSelection;