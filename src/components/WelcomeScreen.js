import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UnoLogo from '../assets/uno.jpg';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const handleOptionSelect = (option) => {
    if (option === 'reservation') navigate('/check-in'); // ✅ must match route path for CheckInScreen
    else if (option === 'new') navigate('/new-reservation');
    else if (option === 'lost') navigate('/lost-card');
  };

  return (
    <div className="d-flex flex-column flex-grow-1 py-4 container-fluid justify-content-center align-items-center">
      <Card
        className="kiosk-card p-4 text-center position-relative"
        style={{ maxWidth: '800px', width: '100%', border: 'none', boxShadow: 'none', borderRadius: '20px' }}
      >
        <Button
          variant="light"
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: '10px', left: '10px', borderRadius: '50%', width: '40px', height: '40px', padding: 0, fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}
        >
          ←
        </Button>

        <div className="mb-4">
          <img src={UnoLogo} alt="UNO Hotels" style={{ maxWidth: '220px', width: '100%', height: 'auto' }} />
        </div>

        <div className="mb-4 px-2" style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.5 }}>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Curabitur sit amet eros eu lacus consequat laoreet.</p>
          <p>Phasellus vitae justo ut odio finibus consectetur.</p>
          <p>Vivamus mattis elit non augue tincidunt.</p>
        </div>

        <div className="d-flex flex-column align-items-center" style={{ gap: '25px' }}>
          <Button
            style={{ backgroundColor: '#E6843D', border: 'none', color: 'white', borderRadius: '30px', fontSize: '0.9rem', padding: '10px 0', width: '70%' }}
            onClick={() => handleOptionSelect('reservation')}
          >
            I Have a Reservation
          </Button>

          <Button
            style={{ backgroundColor: '#E6843D', border: 'none', color: 'white', borderRadius: '30px', fontSize: '0.9rem', padding: '10px 0', width: '70%' }}
            onClick={() => handleOptionSelect('new')}
          >
            New Reservation
          </Button>

          <Button
            style={{ backgroundColor: '#E6843D', border: 'none', color: 'white', borderRadius: '30px', fontSize: '0.9rem', padding: '10px 0', width: '70%' }}
            onClick={() => handleOptionSelect('lost')}
          >
            I Lost My Room Card
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
