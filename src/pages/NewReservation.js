import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Form,
  Row,
  Col,
  Button,
  Container,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { ReservationContext } from "../contexts/ReservationContext";
import { ArrowLeft } from "react-bootstrap-icons";
import { format } from "date-fns";

const NewReservation = () => {
  const navigate = useNavigate();
  const { setReservationData } = useContext(ReservationContext);
  const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const [searchQuery, setSearchQuery] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [corporateCode, setCorporateCode] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;
  const [propertyId, setPropertyId] = useState("");
  const [properties, setProperties] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");

        const response = await axios.get(`${baseUrl}/properties`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setProperties(response.data || []);
      } catch (err) {
        console.error("Error fetching properties:", err);
        if (err.response?.status === 401) {
          setError("Unauthorized: Please ensure backend API access is valid.");
          setTimeout(() => {
            localStorage.removeItem("access_token");
            navigate("/login", { replace: true });
          }, 2000);
        } else {
          setError("Failed to fetch properties. Try again later.");
        }
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [baseUrl, navigate]);

  // ✅ Search available offers
  const handleSearchOffers = async () => {
    if (!propertyId) return setError("Please select a property.");
    if (!startDate || !endDate || endDate <= startDate)
      return setError("Please select valid arrival and departure dates.");

    setLoadingOffers(true);
    setError(null);

    try {
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      const response = await axios.get(`${baseUrl}/check-offers`, {
        params: {
          propertyId,
          arrival: formattedStartDate,
          departure: formattedEndDate,
          adults,
          children: children || 0,
        },
      });

      if (response.data.offers?.length > 0) {
        setOffers(response.data.offers);
      } else {
        setOffers([]);
        setError("No offers available for selected dates.");
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Redirecting to login...");
        setTimeout(() => {
          localStorage.removeItem("access_token");
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError("Failed to fetch offers. Try again later.");
      }
    } finally {
      setLoadingOffers(false);
    }
  };

  // ✅ Create a new reservation
  const handleCreateReservation = async () => {
    if (!propertyId || offers.length === 0)
      return setError("Please select a property and fetch available offers first.");

    try {
      const selectedOffer = offers[0];
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      const bookingData = {
        propertyId,
        Booker: {
          FirstName: "Test",
          LastName: "Admin",
          Email: "testadmin@example.com",
          Phone: "+971500000000",
        },
        Reservations: [
          {
            Arrival: formattedStartDate,
            Departure: formattedEndDate,
            Adults: adults,
            ChildrenAges: children ? Array(children).fill(5) : [],
            OfferId: selectedOffer.id,
            ChannelCode: "Web",
          },
        ],
        CorporateCode: corporateCode || undefined,
        PromoCode: promoCode || undefined,
      };

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${baseUrl}/booking/${propertyId}`,
        bookingData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      const reservationId = response.data.id;

      setReservationData({
        reservationId,
        propertyId,
        offers,
        details: {
          arrival: formattedStartDate,
          departure: formattedEndDate,
          adults,
          children,
          corporateCode,
          promoCode,
        },
      });

      navigate("/check-in");
    } catch (err) {
      console.error("Error creating reservation:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Redirecting to login...");
        setTimeout(() => {
          localStorage.removeItem("access_token");
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError("Failed to create reservation. Try again later.");
      }
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: "#f8f9fa", padding: "30px" }}
    >
      <Card
        className="p-5 border-0 shadow-lg rounded-4 w-100"
        style={{ maxWidth: "1000px", backgroundColor: "#fff" }}
      >
        <div className="relative mb-3">
          <Button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: "#6c757d",
              border: "none",
              color: "#fff",
              borderRadius: "9999px",
            }}
            title="Back"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-center flex-grow-1 mb-0 text-dark">
            🏨 Create New Reservation
          </h2>
          <InputGroup style={{ width: "280px" }}>
            <Form.Control
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="warning"
              onClick={handleSearchOffers}
              disabled={loadingOffers}
            >
              {loadingOffers ? <Spinner size="sm" /> : "🔍"}
            </Button>
          </InputGroup>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card className="p-4 mb-4 border-0 rounded-4 bg-light">
          <Form>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Label>Property *</Form.Label>
                <Form.Select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  disabled={loadingProperties}
                >
                  <option value="">Select property</option>
                  {properties.length > 0 ? (
                    properties
                      .filter((prop) =>
                        prop.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name}
                        </option>
                      ))
                  ) : (
                    <option disabled>No properties available</option>
                  )}
                </Form.Select>
                {loadingProperties && <Spinner size="sm" className="mt-2" />}
              </Col>

              <Col md={4}>
                <Form.Label>Arrival - Departure *</Form.Label>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={setDateRange}
                  dateFormat="MM/dd/yyyy"
                  className="form-control"
                  minDate={new Date()}
                />
              </Col>

              <Col md={2}>
                <Form.Label>Adults *</Form.Label>
                <Form.Control
                  type="number"
                  value={adults}
                  min={1}
                  onChange={(e) => setAdults(Number(e.target.value))}
                />
              </Col>

              <Col md={2}>
                <Form.Label>Children</Form.Label>
                <Form.Control
                  type="number"
                  value={children}
                  min={0}
                  onChange={(e) => setChildren(Number(e.target.value))}
                />
              </Col>
            </Row>

            <Row className="g-3 mt-3">
              <Col md={3}>
                <Form.Label>Corporate Code</Form.Label>
                <Form.Control
                  type="text"
                  value={corporateCode}
                  onChange={(e) => setCorporateCode(e.target.value)}
                />
              </Col>

              <Col md={3}>
                <Form.Label>Promo Code</Form.Label>
                <Form.Control
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </Col>

              <Col md={6} className="d-flex align-items-end">
                <Button
                  onClick={handleCreateReservation}
                  className="w-100"
                  style={{
                    backgroundColor: "#E6843D",
                    border: "none",
                    color: "#fff",
                  }}
                  disabled={loadingOffers}
                >
                  Create Reservation & Proceed
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {offers.length > 0 && (
          <Card className="p-4 border-0 rounded-4 bg-light">
            <h5>Available Offers</h5>
            <ul>
              {offers.map((offer) => (
                <li key={offer.id}>{offer.name || "Offer available"}</li>
              ))}
            </ul>
          </Card>
        )}
      </Card>
    </Container>
  );
};

export default NewReservation;
