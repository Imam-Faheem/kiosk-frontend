import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { submitFeedback } from '../api/api';

const FeedbackForm = ({ reservationId }) => {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: '3',
    comments: '',
    reservationId,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFeedback(feedback);
      setSubmitted(true);
    } catch (error) {
      console.error('Feedback submission failed:', error);
    }
  };

  if (submitted) return <Alert variant="success">Thank you for your feedback!</Alert>;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" value={feedback.name} onChange={(e) => setFeedback({ ...feedback, name: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="email" className="mt-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={feedback.email} onChange={(e) => setFeedback({ ...feedback, email: e.target.value })} />
      </Form.Group>
      <Form.Group controlId="rating" className="mt-3">
        <Form.Label>Rating (1-5)</Form.Label>
        <Form.Control as="select" value={feedback.rating} onChange={(e) => setFeedback({ ...feedback, rating: e.target.value })} required>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="comments" className="mt-3">
        <Form.Label>Comments</Form.Label>
        <Form.Control as="textarea" rows={3} value={feedback.comments} onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })} required />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">Submit</Button>
    </Form>
  );
};

export default FeedbackForm;