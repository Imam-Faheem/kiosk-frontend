import React from 'react';
import usePropertyStore from '../stores/propertyStore';
import UnoLogo from '../assets/uno.jpg';

const PropertyLogo = ({ size = 50, style = {}, alt, ...props }) => {
  const { selectedProperty } = usePropertyStore();
  const logoUrl = selectedProperty?.configuration?.logo_url || selectedProperty?.logo_url || selectedProperty?.logo;
  const propertyName = selectedProperty?.name || selectedProperty?.property_name || 'Property';
  const defaultStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '8px',
    objectFit: 'cover',
    ...style,
  };

  return (
    <img
      src={logoUrl || UnoLogo}
      alt={alt || `${propertyName} Logo`}
      style={defaultStyle}
      onError={(e) => {
        if (logoUrl) e.target.src = UnoLogo;
      }}
      {...props}
    />
  );
};

export default PropertyLogo;

