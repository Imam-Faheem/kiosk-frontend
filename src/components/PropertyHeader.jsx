import React from 'react';
import { Group, Title } from '@mantine/core';
import usePropertyStore from '../stores/propertyStore';
import PropertyLogo from './PropertyLogo';
import useLanguage from '../hooks/useLanguage';

const PropertyHeader = ({ showName = true, logoSize = 50, titleStyle = {}, ...props }) => {
  const { selectedProperty } = usePropertyStore();
  const { t } = useLanguage();
  const propertyName = selectedProperty?.name || selectedProperty?.property_name || '';

  return (
    <Group gap="md" {...props}>
      <PropertyLogo size={logoSize} alt={propertyName || t('common.propertyLogo')} />
      {showName && propertyName && (
        <Title
          order={2}
          style={{
            fontSize: '30px !important',
            color: 'rgb(34, 34, 34)',
            fontWeight: '600',
            letterSpacing: '2px',
            ...titleStyle,
          }}
        >
          {propertyName}
        </Title>
      )}
    </Group>
  );
};

export default PropertyHeader;

