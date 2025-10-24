import React, { useContext, useState, useRef } from "react";
import { Card, Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import SignatureCanvas from "react-signature-canvas";
import SignaturePad from "../components/SignaturePad";
import axios from "axios";
import { ReservationContext } from "../contexts/ReservationContext";

const SignatureConsent = () => {
  const navigate = useNavigate();
  const { reservationData, setReservationData } = useContext(ReservationContext);

  const [details, setDetails] = useState(reservationData.details || {});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCustomSignature, setUseCustomSignature] = useState(false);
  const sigCanvas = useRef(null);

  const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const clearSignature = () => sigCanvas.current.clear();

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      setError("Please provide signature before saving.");
      return;
    }
    try {
      // Use toDataURL instead of getTrimmedCanvas to avoid the trim_canvas error
      const signatureData = sigCanvas.current.toDataURL("image/png");
      setDetails(prev => ({
        ...prev,
        signature: signatureData
      }));
      setError(null);
    } catch (err) {
      console.error("Error saving signature:", err);
      setError("Error saving signature. Please try again.");
    }
  };

  const handleCustomSignature = (signatureData) => {
    setDetails(prev => ({
      ...prev,
      signature: signatureData
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!details.consent) return setError("Consent required");
    if (!details.signature) return setError("Signature required");

    setLoading(true);
    try {
      const formData = {
        ...details,
        reservation_id: reservationData.reservationId,
        property_id: reservationData.propertyId
      };
      await axios.post(`${baseUrl}/forms`, formData, { withCredentials: true });

      setSuccess("Reservation submitted successfully!");
      setReservationData(prev => ({ ...prev, details })); 

      setTimeout(() => navigate("/home"), 2000);
    } catch (err) {
      setError("Failed to submit form.");
      console.error(err);
    } finally {
      setLoading(false);
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
        style={{ maxWidth: "800px", backgroundColor: "#fff" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="light" onClick={() => navigate("/check-in")}>
            <ArrowLeft />
          </Button>
          <h2 className="fw-bold text-center flex-grow-1 mb-0 text-dark">
            🖊️ Signature & Consent
          </h2>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form>
          <Form.Check
            type="checkbox"
            label="I give consent"
            checked={details.consent || false}
            onChange={(e) =>
              setDetails(prev => ({ ...prev, consent: e.target.checked }))
            }
            className="mb-3"
          />

          <div className="mb-3">
            <div className="mb-2">
              <Button
                variant="outline"
                size="sm"
                className="me-2"
                onClick={() => setUseCustomSignature(!useCustomSignature)}
              >
                {useCustomSignature ? "Use Library Signature" : "Use Custom Signature"}
              </Button>
            </div>
            
            {useCustomSignature ? (
              <SignaturePad
                onSignatureChange={handleCustomSignature}
                width={600}
                height={200}
              />
            ) : (
              <>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ width: 600, height: 200, className: "border" }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2 me-2"
                  onClick={clearSignature}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={saveSignature}
                >
                  Save
                </Button>
              </>
            )}
          </div>

          <div className="text-center mt-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2"
              style={{ backgroundColor: "#E6843D", border: "none", color: "#fff" }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default SignatureConsent;
