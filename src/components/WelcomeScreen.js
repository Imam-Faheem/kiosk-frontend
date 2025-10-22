import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import UnoLogo from '../assets/uno.jpg';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const handleOptionSelect = (option) => {
    if (option === 'reservation') navigate('/checkin');
    else if (option === 'new') navigate('/new-reservation');
    else if (option === 'lost') navigate('/lost-card');
  };

  return (
    <div className="d-flex flex-column flex-grow-1 py-4 container-fluid justify-content-center align-items-center">
      <Card
        className="kiosk-card p-4 text-center position-relative"
        style={{
          maxWidth: '800px',
          width: '100%',
        }}
      >
        {/* Back Button Top Left */}
        <Button
          variant="light"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            padding: 0,
            fontWeight: 'bold',
            fontSize: '1.2rem',
            lineHeight: 1,
          }}
        >
          ←
        </Button>

        {/* Centered UNO Image */}
        <div className="mb-4">
          <img
            src={UnoLogo}
            alt="UNO Hotels"
            style={{ maxWidth: '220px', width: '100%', height: 'auto' }}
          />
        </div>

        {/* Dummy Text Below Image */}
        <div className="mb-4 px-2" style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.5 }}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Curabitur sit amet eros eu lacus consequat laoreet.</p>
          <p>Phasellus vitae justo ut odio finibus consectetur.</p>
          <p>Nullam vehicula ex sed metus interdum, id varius nunc commodo.</p>
          <p>Vivamus mattis elit non augue tincidunt, a scelerisque lorem eleifend.</p>
        </div>

        {/* Vertical Buttons */}
        <div className="d-flex flex-column align-items-center" style={{ gap: '25px' }}>
          <Button
            className="kiosk-button"
            style={{
              backgroundColor: '#DD7733',
              border: 'none',
              color: 'white',
              borderRadius: '30px',
              fontSize: '0.9rem',
              padding: '10px 0',
              width: '70%',
            }}
            onClick={() => handleOptionSelect('reservation')}
          >
            I Have a Reservation
          </Button>

          <Button
            className="kiosk-button"
            style={{
              backgroundColor: '#DD7733',
              border: 'none',
              color: 'white',
              borderRadius: '30px',
              fontSize: '0.9rem',
              padding: '10px 0',
              width: '70%',
            }}
            onClick={() => handleOptionSelect('new')}
          >
            New Reservation
          </Button>

          <Button
            className="kiosk-button"
            style={{
              backgroundColor: '#DD7733',
              border: 'none',
              color: 'white',
              borderRadius: '30px',
              fontSize: '0.9rem',
              padding: '10px 0',
              width: '70%',
            }}
            onClick={() => handleOptionSelect('lost')}
          >
            I Lost My Room Card
          </Button>
        </div>
      </Card>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (min-width: 768px) {
          .kiosk-card {
            max-width: 700px;
            padding: 3rem;
          }
        }

        @media (min-width: 1024px) {
          .kiosk-card {
            max-width: 800px;
            padding: 4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
