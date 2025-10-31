import React from 'react';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const BackButton = ({ onClick, text, size = "lg", disabled, styles: customStyles, ...props }) => {
  const { t } = useTranslation();

  const baseStyles = {
    root: {
      backgroundColor: '#FFFFFF',
      color: '#C8653D',
      borderColor: '#C8653D',
      borderWidth: '2px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      minWidth: 'auto',
      padding: '8px 16px',
    },
  };

  const mergedStyles = customStyles 
    ? { root: { ...baseStyles.root, ...customStyles.root } }
    : baseStyles;

  return (
    <Button
      size={size}
      variant="outline"
      color="uno"
      leftSection={<IconArrowLeft size={16} />}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      styles={mergedStyles}
      onMouseEnter={(e) => {
        if (!disabled && e.currentTarget) {
          e.currentTarget.style.backgroundColor = '#FFF7F3';
          e.currentTarget.style.color = '#C8653D';
          e.currentTarget.style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && e.currentTarget) {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.color = '#C8653D';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      {...props}
    >
      {text || t('common.back')}
    </Button>
  );
};

export default BackButton;
