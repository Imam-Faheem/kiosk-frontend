import React from 'react';
import {
  Group,
  Button,
  Stack,
  Text,
  Progress,
  Box,
  Divider,
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconArrowRight, 
  IconCheck,
  IconX,
  IconHome,
  IconSettings,
} from '@tabler/icons-react';

const StepNavigation = ({
  stepNavigation,
  onBack,
  onExit,
  onHome,
  onSettings,
  showProgress = true,
  showStepNumbers = true,
  showBackButton = true,
  showNextButton = true,
  showFinishButton = false,
  showExitButton = false,
  showHomeButton = false,
  showSettingsButton = false,
  backButtonText = "Back",
  nextButtonText = "Next",
  finishButtonText = "Finish",
  exitButtonText = "Exit",
  homeButtonText = "Home",
  settingsButtonText = "Settings",
  onNext,
  onFinish,
  isLoading = false,
  isSubmitting = false,
  canProceed = true,
  validationErrors = [],
  ...props
}) => {
  const {
    currentStep,
    totalSteps,
    progress,
    canGoBack,
    canGoForward,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
  } = stepNavigation || {};

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (stepNavigation) {
      stepNavigation.goToNextStep();
    }
  };

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    } else if (stepNavigation) {
      stepNavigation.complete();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (stepNavigation) {
      stepNavigation.goToPreviousStep();
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else if (stepNavigation) {
      stepNavigation.goHome();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else if (stepNavigation) {
      stepNavigation.goHome();
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else if (stepNavigation) {
      stepNavigation.goHome();
    }
  };

  return (
    <Box>
      {/* Progress Bar */}
      {showProgress && currentStep && totalSteps && (
        <Box mb="xl">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">
              Step {currentStep} of {totalSteps}
            </Text>
            <Text size="sm" c="dimmed">
              {Math.round(progress || 0)}%
            </Text>
          </Group>
          <Progress
            value={progress || 0}
            size="sm"
            radius="xl"
            color="#C8653D"
            style={{ height: '8px' }}
          />
        </Box>
      )}

      {/* Step Numbers */}
      {showStepNumbers && currentStep && totalSteps && (
        <Box mb="lg">
          <Group justify="center" gap="xs">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <Box
                  key={stepNumber}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted 
                      ? '#4CAF50' 
                      : isActive 
                        ? '#C8653D' 
                        : '#E0E0E0',
                    color: isCompleted || isActive ? '#FFFFFF' : '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    border: isActive ? '2px solid #C8653D' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCompleted ? <IconCheck size={16} /> : stepNumber}
                </Box>
              );
            })}
          </Group>
        </Box>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Box mb="lg">
          <Text size="sm" c="red" fw={500} mb="xs">
            Please fix the following errors:
          </Text>
          <Stack gap="xs">
            {validationErrors.map((error, index) => (
              <Text key={index} size="sm" c="red">
                • {error}
              </Text>
            ))}
          </Stack>
        </Box>
      )}

      <Divider mb="lg" />

      {/* Navigation Buttons */}
      <Group justify="space-between">
        {/* Left Side - Back and Exit */}
        <Group>
          {showBackButton && canGoBack && (
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
              disabled={isLoading || isSubmitting}
              color="#C8653D"
            >
              {backButtonText}
            </Button>
          )}

          {showExitButton && (
            <Button
              variant="light"
              leftSection={<IconX size={16} />}
              onClick={handleExit}
              disabled={isLoading || isSubmitting}
              color="gray"
            >
              {exitButtonText}
            </Button>
          )}

          {showHomeButton && (
            <Button
              variant="light"
              leftSection={<IconHome size={16} />}
              onClick={handleHome}
              disabled={isLoading || isSubmitting}
              color="#C8653D"
            >
              {homeButtonText}
            </Button>
          )}

          {showSettingsButton && (
            <Button
              variant="light"
              leftSection={<IconSettings size={16} />}
              onClick={handleSettings}
              disabled={isLoading || isSubmitting}
              color="#C8653D"
            >
              {settingsButtonText}
            </Button>
          )}
        </Group>

        {/* Right Side - Next and Finish */}
        <Group>
          {showNextButton && canGoForward && (
            <Button
              rightSection={<IconArrowRight size={16} />}
              onClick={handleNext}
              disabled={!canProceed || isLoading || isSubmitting}
              loading={isLoading || isSubmitting}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
              }}
            >
              {nextButtonText}
            </Button>
          )}

          {showFinishButton && isLastStep && (
            <Button
              rightSection={<IconCheck size={16} />}
              onClick={handleFinish}
              disabled={!canProceed || isLoading || isSubmitting}
              loading={isLoading || isSubmitting}
              style={{
                backgroundColor: '#4CAF50',
                color: '#FFFFFF',
              }}
            >
              {finishButtonText}
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  );
};

export default StepNavigation;
