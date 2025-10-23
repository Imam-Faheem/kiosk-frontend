import React from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import "./LanguageSelector.css";

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
  const { updateLanguage } = useAppContext();

  const handleLanguageClick = (lang) => {
    updateLanguage(lang);
    navigate("/home");
  };

  return (
    <div className="language-container d-flex justify-content-center align-items-center min-vh-100">
      <Card
        className="p-4 text-center"
        style={{
          border: "none",
          boxShadow: "none",
          backgroundColor: "transparent",
        }}
      >
        <h2 className="mb-4">Select Language</h2>
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