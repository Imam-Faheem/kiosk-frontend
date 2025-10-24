import React from 'react';
import StepWrapper from '../StepWrapper';
import StepForm from './StepForm';
import StepDisplay from './StepDisplay';
import StepNavigation from './StepNavigation';
import { useStepNavigation } from '../../hooks/useStepNavigation';

// Example 1: Basic StepWrapper with StepForm
const BasicStepFormExample = () => {
  return (
    <StepWrapper
      title="Guest Information"
      subtitle="Please provide your details"
      stepNumber={1}
      totalSteps={5}
      showProgress={true}
      enableStepNavigation={true}
    >
      <StepForm
        fields={[
          {
            name: 'firstName',
            type: 'text',
            label: 'First Name',
            placeholder: 'Enter your first name',
            required: true,
          },
          {
            name: 'lastName',
            type: 'text',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            required: true,
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email',
            required: true,
          },
        ]}
        onSubmit={(data) => console.log('Form submitted:', data)}
        onSave={(data) => console.log('Form saved:', data)}
      />
    </StepWrapper>
  );
};

// Example 2: StepWrapper with StepDisplay
const StepDisplayExample = () => {
  return (
    <StepWrapper
      title="Confirmation"
      subtitle="Please review your information"
      stepNumber={2}
      totalSteps={5}
      showProgress={true}
      enableStepNavigation={true}
    >
      <StepDisplay
        title="Review Your Information"
        subtitle="Please verify the details below"
        type="confirmation"
        data={{
          'First Name': 'John',
          'Last Name': 'Doe',
          'Email': 'john.doe@example.com',
          'Phone': '+1 (555) 123-4567',
        }}
        actions={[
          {
            label: 'Edit',
            variant: 'light',
            color: '#C8653D',
            onClick: () => console.log('Edit clicked'),
          },
          {
            label: 'Continue',
            variant: 'filled',
            color: '#C8653D',
            onClick: () => console.log('Continue clicked'),
          },
        ]}
      />
    </StepWrapper>
  );
};

// Example 3: StepWrapper with StepNavigation
const StepNavigationExample = () => {
  return (
    <StepWrapper
      title="Navigation Example"
      subtitle="Step navigation controls"
      stepNumber={3}
      totalSteps={5}
      showProgress={true}
      enableStepNavigation={true}
      showBackButton={true}
      showExitButton={true}
      showHomeButton={true}
      showSettingsButton={true}
    >
      <StepNavigation
        showProgress={true}
        showStepNumbers={true}
        showBackButton={true}
        showNextButton={true}
        showFinishButton={false}
        showExitButton={true}
        showHomeButton={true}
        showSettingsButton={true}
        onNext={() => console.log('Next clicked')}
        onFinish={() => console.log('Finish clicked')}
        onBack={() => console.log('Back clicked')}
        onExit={() => console.log('Exit clicked')}
        onHome={() => console.log('Home clicked')}
        onSettings={() => console.log('Settings clicked')}
      />
    </StepWrapper>
  );
};

// Example 4: Custom Component with StepWrapper Integration
const CustomStepComponent = ({ 
  stepNavigation, 
  onBack, 
  onExit, 
  onHome, 
  onSettings,
  goToNextStep,
  goToPreviousStep,
  updateStepData,
  getStepData,
  currentStep,
  totalSteps,
  progress,
  isCompleted,
  canProceed,
  errors,
  isLoading,
  canGoBack,
  canGoForward,
  isFirstStep,
  isLastStep,
  reset,
  complete,
  clearSavedState,
  setIsLoading,
  setCanProceed,
  setIsCompleted,
}) => {
  const handleNext = () => {
    if (goToNextStep) {
      goToNextStep();
    }
  };

  const handleBack = () => {
    if (goToPreviousStep) {
      goToPreviousStep();
    }
  };

  const handleSave = (data) => {
    if (updateStepData) {
      updateStepData(currentStep, data);
    }
  };

  return (
    <div>
      <h2>Custom Step Component</h2>
      <p>Current Step: {currentStep} of {totalSteps}</p>
      <p>Progress: {progress}%</p>
      <p>Can Proceed: {canProceed ? 'Yes' : 'No'}</p>
      <p>Is Completed: {isCompleted ? 'Yes' : 'No'}</p>
      
      {errors && Object.keys(errors).length > 0 && (
        <div>
          <h3>Errors:</h3>
          <ul>
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{key}: {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <button onClick={handleBack} disabled={!canGoBack}>
          Back
        </button>
        <button onClick={handleNext} disabled={!canGoForward}>
          Next
        </button>
        <button onClick={onBack}>Custom Back</button>
        <button onClick={onExit}>Exit</button>
        <button onClick={onHome}>Home</button>
        <button onClick={onSettings}>Settings</button>
      </div>
    </div>
  );
};

// Example 5: StepWrapper with Custom Component
const CustomStepWrapperExample = () => {
  return (
    <StepWrapper
      title="Custom Step"
      subtitle="Using custom component with StepWrapper"
      stepNumber={4}
      totalSteps={5}
      showProgress={true}
      enableStepNavigation={true}
      showBackButton={true}
      showExitButton={true}
      showHomeButton={true}
      showSettingsButton={true}
      childrenProps={{
        customProp: 'Custom Value',
        onCustomAction: () => console.log('Custom action triggered'),
      }}
    >
      <CustomStepComponent />
    </StepWrapper>
  );
};

// Example 6: Multi-step Form with StepWrapper
const MultiStepFormExample = () => {
  const stepNav = useStepNavigation(1, 3, {
    autoSave: true,
    autoSaveInterval: 30000,
    validateOnChange: true,
  });

  const handleStep1Submit = (data) => {
    stepNav.updateStepData(1, data);
    stepNav.goToNextStep();
  };

  const handleStep2Submit = (data) => {
    stepNav.updateStepData(2, data);
    stepNav.goToNextStep();
  };

  const handleStep3Submit = (data) => {
    stepNav.updateStepData(3, data);
    stepNav.complete();
  };

  return (
    <div>
      <StepWrapper
        title="Step 1: Personal Information"
        stepNumber={1}
        totalSteps={3}
        showProgress={true}
        enableStepNavigation={true}
      >
        <StepForm
          fields={[
            { name: 'firstName', type: 'text', label: 'First Name', required: true },
            { name: 'lastName', type: 'text', label: 'Last Name', required: true },
          ]}
          onSubmit={handleStep1Submit}
        />
      </StepWrapper>

      <StepWrapper
        title="Step 2: Contact Information"
        stepNumber={2}
        totalSteps={3}
        showProgress={true}
        enableStepNavigation={true}
      >
        <StepForm
          fields={[
            { name: 'email', type: 'email', label: 'Email', required: true },
            { name: 'phone', type: 'tel', label: 'Phone', required: true },
          ]}
          onSubmit={handleStep2Submit}
        />
      </StepWrapper>

      <StepWrapper
        title="Step 3: Confirmation"
        stepNumber={3}
        totalSteps={3}
        showProgress={true}
        enableStepNavigation={true}
      >
        <StepDisplay
          type="confirmation"
          title="Review Your Information"
          data={stepNav.getAllStepData()}
          actions={[
            {
              label: 'Submit',
              variant: 'filled',
              color: '#C8653D',
              onClick: () => stepNav.complete(),
            },
          ]}
        />
      </StepWrapper>
    </div>
  );
};

// Export all examples
export {
  BasicStepFormExample,
  StepDisplayExample,
  StepNavigationExample,
  CustomStepComponent,
  CustomStepWrapperExample,
  MultiStepFormExample,
};

export default {
  BasicStepFormExample,
  StepDisplayExample,
  StepNavigationExample,
  CustomStepComponent,
  CustomStepWrapperExample,
  MultiStepFormExample,
};
