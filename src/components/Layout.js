import React from 'react';
import { Navbar, Container, Nav, Carousel } from 'react-bootstrap';
import { useAppContext } from '../contexts/AppContext';

const Layout = ({ children }) => {
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Karachi',
  });

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">
            <img
              src="/logo.jpg"
              alt="UNO HOTELS"
              style={{
                height: '50px',
                width: 'auto',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </Navbar.Brand>

          <Nav className="ms-auto">
            <Nav.Link as="span" style={{ color: '#ccc', fontWeight: 500 }}>
              {currentTime}
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="flex-grow-1 py-4">{children}</Container>

      {/* Footer */}
      <footer className="bg-light p-3 mt-auto">
        <Carousel interval={3000} indicators={false}>
          <Carousel.Item>
            <p className="text-center m-0">Special Offer: 20% Off Weekend Stays!</p>
          </Carousel.Item>
          <Carousel.Item>
            <p className="text-center m-0">Visit Local Sights - Guided Tours Available</p>
          </Carousel.Item>
        </Carousel>
        <p className="text-center text-muted m-0 mt-2">Emergency: +92-123-4567890</p>
      </footer>
    </div>
  );
};

export default Layout;
