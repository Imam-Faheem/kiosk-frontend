import React from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '/flags/de.png' },
  { code: 'fr', name: 'Français', flag: '/flags/fr.png' },
  { code: 'en', name: 'English', flag: '/flags/gb.png' },
  { code: 'es', name: 'Español', flag: '/flags/es.png' },
  { code: 'it', name: 'Italiano', flag: '/flags/it.png' },
  { code: 'pt', name: 'Português', flag: '/flags/pt.png' },
];

const LanguageSelector = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const handleLanguageClick = (lang) => {
    i18n.changeLanguage(lang);
    navigate('/home');
  };

  return (
    <Card className="kiosk-card p-4 text-center">
      <h2>{t('selectLanguage')}</h2>
      <div className="language-grid mt-4">
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
  );
};

export default LanguageSelector;
