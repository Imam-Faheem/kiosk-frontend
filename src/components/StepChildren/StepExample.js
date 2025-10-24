import React from 'react';
import StepWrapper from '../StepWrapper';
import StepForm from './StepForm';
import StepDisplay from './StepDisplay';
import StepNavigation from './StepNavigation';

// Example usage of StepWrapper with different children components
const StepExample = () => {
  return (
    <div>
      {/* Example 1: StepWrapper with StepForm */}
      <StepWrapper
        title="Guest Information"
        subtitle="Please provide your details"
        stepNumber={1}
        totalSteps={5}
        showProgress={true}
        enableStepNavigation={true}
        showBackButton={true}
        showExitButton={true}
      >
        <StepForm
          title="Personal Details"
          description="Enter your personal information below"
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
            {
              name: 'phone',
              type: 'tel',
              label: 'Phone Number',
              placeholder: 'Enter your phone number',
              required: true,
            },
          ]}
          onSubmit={(data) => console.log('Form submitted:', data)}
          onSave={(data) => console.log('Form saved:', data)}
        />
      </StepWrapper>

      {/* Example 2: StepWrapper with StepDisplay */}
      <StepWrapper
        title="Confirmation"
        subtitle="Please review your information"
        stepNumber={2}
        totalSteps={5}
        showProgress={true}
        enableStepNavigation={true}
        showBackButton={true}
        showExitButton={true}
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

      {/* Example 3: StepWrapper with StepNavigation */}
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
    </div>
  );
};

export default StepExample;
