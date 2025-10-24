import React, { cloneElement, isValidElement } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Progress,
} from '@mantine/core';
import { IconArrowLeft, IconX, IconHome, IconSettings } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useStepNavigation } from '../hooks/useStepNavigation';

const StepWrapper = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  showExitButton = true,
  showHomeButton = false,
  showSettingsButton = false,
  onBack,
  onExit,
  onHome,
  onSettings,
  backButtonText = "Back",
  exitButtonText = "Exit",
  homeButtonText = "Home",
  settingsButtonText = "Settings",
  stepNumber,
  totalSteps,
  showProgress = false,
  enableStepNavigation = false,
  stepNavigationProps = {},
  className = "",
  childrenProps = {},
  ...props
}) => {
  const navigate = useNavigate();
  
  // Use step navigation hook if enabled
  const stepNav = enableStepNavigation ? useStepNavigation(
    stepNumber || 1, 
    totalSteps || 5, 
    stepNavigationProps
  ) : null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (stepNav) {
      stepNav.goToPreviousStep();
    } else {
      navigate(-1);
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/');
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      navigate('/home');
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      navigate('/settings');
    }
  };

  // Clone children with additional props and navigation functions
  const renderChildren = () => {
    if (isValidElement(children)) {
      return cloneElement(children, {
        ...childrenProps,
        // Step navigation hook
        stepNavigation: stepNav,
        // Navigation functions
        onBack: handleBack,
        onExit: handleExit,
        onHome: handleHome,
        onSettings: handleSettings,
        // Step navigation methods
        goToNextStep: stepNav?.goToNextStep,
        goToPreviousStep: stepNav?.goToPreviousStep,
        goToStep: stepNav?.goToStep,
        // Step data methods
        updateStepData: stepNav?.updateStepData,
        getStepData: stepNav?.getStepData,
        clearStepData: stepNav?.clearStepData,
        getAllStepData: stepNav?.getAllStepData,
        // Validation methods
        validateStep: stepNav?.validateStep,
        isStepValid: stepNav?.isStepValid,
        areAllStepsValid: stepNav?.areAllStepsValid,
        // State
        currentStep: stepNav?.currentStep,
        totalSteps: stepNav?.totalSteps,
        progress: stepNav?.progress,
        isCompleted: stepNav?.isCompleted,
        canProceed: stepNav?.canProceed,
        errors: stepNav?.errors,
        isLoading: stepNav?.isLoading,
        // Navigation state
        canGoBack: stepNav?.canGoBack,
        canGoForward: stepNav?.canGoForward,
        isFirstStep: stepNav?.isFirstStep,
        isLastStep: stepNav?.isLastStep,
        // Utilities
        reset: stepNav?.reset,
        complete: stepNav?.complete,
        clearSavedState: stepNav?.clearSavedState,
        setIsLoading: stepNav?.setIsLoading,
        setCanProceed: stepNav?.setCanProceed,
        setIsCompleted: stepNav?.setIsCompleted,
      });
    }
    return children;
  };

  return (
    <Container
      size="lg"
      className={`step-wrapper ${className}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
      }}
      {...props}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Group>
            <Box
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#C8653D',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              UNO HOTELS
            </Title>
          </Group>
          
          {showExitButton && (
            <Button
              variant="light"
              size="sm"
              leftSection={<IconX size={16} />}
              onClick={handleExit}
              style={{
                backgroundColor: '#E0E0E0',
                color: '#000000',
                border: '1px solid #D0D0D0',
              }}
            >
              {exitButtonText}
            </Button>
          )}
        </Group>

        {/* Progress Indicator */}
        {showProgress && stepNumber && totalSteps && (
          <Box mb="lg">
            <Text size="sm" c="dimmed" mb="xs">
              Step {stepNumber} of {totalSteps}
            </Text>
            <Box
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#E0E0E0',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  width: `${(stepNumber / totalSteps) * 100}%`,
                  height: '100%',
                  backgroundColor: '#C8653D',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
          </Box>
        )}

        {/* Title and Subtitle */}
        {(title || subtitle) && (
          <Stack gap="md" mb="xl" align="center">
            {title && (
              <Title order={1} c="#0B152A" fw={700} ta="center">
                {title}
              </Title>
            )}
            {subtitle && (
              <Text c="dimmed" size="lg" ta="center">
                {subtitle}
              </Text>
            )}
          </Stack>
        )}

        {/* Main Content */}
        <Box mb="xl">
          {renderChildren()}
        </Box>

        {/* Back Button */}
        {showBackButton && (
          <Group justify="flex-start">
            <Button
              variant="filled"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '10px 20px',
                fontWeight: 'bold',
              }}
            >
              {backButtonText}
            </Button>
          </Group>
        )}
      </Paper>
    </Container>
  );
};

export default StepWrapper;