import React from 'react';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const BackButton = ({ onClick, text, size = "lg", ...props }) => {
  const { t } = useTranslation();

  return (
    <Button
      size={size}
      leftSection={<IconArrowLeft size={16} />}
      onClick={onClick}
      style={{
        backgroundColor: '#C8653D',
        color: '#FFFFFF',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        ...props.style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#B8552F';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#C8653D';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...props}
    >
      {text || t('common.back')}
    </Button>
  );
};

export default BackButton;
