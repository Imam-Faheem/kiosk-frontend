import React from 'react';
import { Navbar, Container, Nav, Carousel } from 'react-bootstrap';
import { useAppContext } from '../contexts/AppContext';

const Layout = ({ children }) => {
  const { state } = useAppContext();
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }); // 04:17 PM PKT, Oct 21, 2025

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">
            <img src="/logo.png" alt="UNO HOTELS" style={{ height: '40px' }} />
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link>{currentTime}</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container className="flex-grow-1 py-4">
        {children}
      </Container>
      <footer className="bg-light p-3">
        <Carousel interval={3000}>
          <Carousel.Item>
            <p className="text-center m-0">Special Offer: 20% Off Weekend Stays!</p>
          </Carousel.Item>
          <Carousel.Item>
            <p className="text-center m-0">Visit Local Sights - Guided Tours Available</p>
          </Carousel.Item>
        </Carousel>
        <p className="text-center text-muted m-0">Emergency: +92-123-4567890</p>
      </footer>
    </div>
  );
};

export default Layout;