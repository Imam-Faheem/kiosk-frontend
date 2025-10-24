import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
// CSS import removed - using Mantine styles instead

const languages = [
  { code: "de", name: "Deutsch", flag: "/flags/de.png" },
  { code: "fr", name: "Français", flag: "/flags/fr.png" },
  { code: "en", name: "English", flag: "/flags/gb.png" },
  { code: "es", name: "Español", flag: "/flags/es.png" },
  { code: "it", name: "Italiano", flag: "/flags/it.png" },
  { code: "pt", name: "Português", flag: "/flags/pt.png" },
];

const LanguageSelector = () => {
  const navigate = useNavigate();
  const { updateLanguage } = useAuthStore();

  const handleLanguageClick = (lang) => {
    updateLanguage(lang);
    navigate("/home");
  };

  return (
    <div className="language-container d-flex justify-content-center align-items-center min-vh-100 position-relative">
      <Card
        className="p-4 text-center"
        style={{
          border: "none",
          boxShadow: "none",
          backgroundColor: "transparent",
          position: "relative",
        }}
      >
        {/* 🩶 Back Button - near Select Language title */}
        <div className="d-flex align-items-center justify-content-start mb-3" style={{ marginLeft: "10px" }}>
          <Button
            variant="light"
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: "#d3d3d3",
              color: "#000",
              border: "none",
              borderRadius: "20px",
              padding: "6px 16px",
              fontWeight: "500",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            ← Back
          </Button>
        </div>

        <h2 className="mb-4 mt-2">Select Language</h2>

        <div className="language-grid">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="language-item"
              onClick={() => handleLanguageClick(lang.code)}
            >
              <img src={lang.flag} alt={lang.name} />
              <p>{lang.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LanguageSelector;
