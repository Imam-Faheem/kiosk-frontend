import React, { useEffect, useState } from 'react';
import { Group, Title, Image } from '@mantine/core';
import usePropertyStore from '../stores/propertyStore';
import UnoLogo from '../assets/uno.jpg';

const PropertyHeader = () => {
  const { selectedProperty, propertyId, _hasHydrated } = usePropertyStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (_hasHydrated !== undefined) {
      setIsHydrated(_hasHydrated);
    } else {
      setIsHydrated(true);
    }
  }, [_hasHydrated]);

  const logoUrl = selectedProperty?.configuration?.logo_url || UnoLogo;
  const propertyName = selectedProperty?.name || 'UNO HOTELS';

  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <Image
        src={logoUrl}
        alt={`${propertyName} Logo`}
        w={50}
        h={50}
        radius="md"
        fit="cover"
        fallbackSrc={UnoLogo}
        style={{ flexShrink: 0 }}
        onError={(e) => {
          e.target.src = UnoLogo;
        }}
      />
      <Title 
        order={2}
        fw={600}
        c="dark.9"
        style={{ 
          fontSize: '30px',
          letterSpacing: '1px',
          lineHeight: '1.2',
          wordBreak: 'break-word',
          overflow: 'visible'
        }}
      >
        {propertyName}
      </Title>
    </Group>
  );
};

export default PropertyHeader;

