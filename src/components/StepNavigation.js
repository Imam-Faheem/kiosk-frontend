import React from 'react';
import { Group, Button, Stack } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';

const StepNavigation = ({
  onPrevious,
  onNext,
  onFinish,
  previousText = "Previous",
  nextText = "Next",
  finishText = "Finish",
  showPrevious = true,
  showNext = true,
  showFinish = false,
  isNextDisabled = false,
  isPreviousDisabled = false,
  isLoading = false,
  className = "",
  ...props
}) => {
  return (
    <Group justify="space-between" className={`step-navigation ${className}`} {...props}>
      <Button
        variant="outline"
        leftSection={<IconArrowLeft size={16} />}
        onClick={onPrevious}
        disabled={isPreviousDisabled || isLoading}
        style={{
          borderRadius: '20px',
          padding: '10px 20px',
          fontWeight: 'bold',
        }}
      >
        {previousText}
      </Button>

      <Stack align="center" gap="xs">
        {showNext && (
          <Button
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
            onClick={onNext}
            disabled={isNextDisabled || isLoading}
            loading={isLoading}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '10px 30px',
              fontWeight: 'bold',
            }}
          >
            {nextText}
          </Button>
        )}

        {showFinish && (
          <Button
            variant="filled"
            rightSection={<IconCheck size={16} />}
            onClick={onFinish}
            disabled={isLoading}
            loading={isLoading}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '10px 30px',
              fontWeight: 'bold',
            }}
          >
            {finishText}
          </Button>
        )}
      </Stack>
    </Group>
  );
};

export default StepNavigation;
