# StepWrapper System Guide

## Overview

The StepWrapper system is a comprehensive solution for creating multi-step forms and navigation flows in the UNO Hotels application. It provides a consistent, branded interface with advanced functionality including auto-save, validation, and step navigation.

## Core Components

### 1. StepWrapper.js
The main wrapper component that provides:
- Consistent UNO Hotels branding
- Navigation controls (Back, Exit, Home, Settings)
- Progress tracking
- Children component integration
- Auto-save functionality

### 2. StepChildren Components

#### StepForm.js
A form component with:
- Dynamic field rendering
- Real-time validation
- Auto-save functionality
- Error handling
- Submit/save actions

#### StepDisplay.js
A display component for:
- Information display
- Confirmation screens
- Data review
- Action buttons
- Different display types (info, success, warning, error, confirmation)

#### StepNavigation.js
Navigation controls with:
- Progress bar
- Step indicators
- Navigation buttons
- Validation error display
- Customizable button configurations

### 3. Schema System (stepSchema.js)
Comprehensive validation and configuration schemas:
- Step navigation validation
- Button configuration
- Layout configuration
- Form validation
- Multi-step form management

### 4. useStepNavigation Hook
Advanced hook providing:
- Step state management
- Auto-save functionality
- Validation handling
- Navigation controls
- Data persistence

## Usage Examples

### Basic StepWrapper Usage

```javascript
import StepWrapper from '../components/StepWrapper';
import StepForm from '../components/StepChildren/StepForm';

const MyStep = () => {
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
            required: true,
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            required: true,
          },
        ]}
        onSubmit={(data) => console.log('Submitted:', data)}
      />
    </StepWrapper>
  );
};
```

### Advanced Configuration

```javascript
<StepWrapper
  title="Reservation Details"
  subtitle="Complete your booking"
  stepNumber={2}
  totalSteps={5}
  showProgress={true}
  enableStepNavigation={true}
  showBackButton={true}
  showExitButton={true}
  showHomeButton={true}
  showSettingsButton={true}
  stepNavigationProps={{
    autoSave: true,
    autoSaveInterval: 30000,
    validateOnChange: true,
  }}
  childrenProps={{
    customProp: 'value',
    onCustomAction: handleCustomAction,
  }}
>
  <StepDisplay
    type="confirmation"
    title="Review Your Reservation"
    data={{
      'Check-in': '2024-01-15',
      'Check-out': '2024-01-18',
      'Guests': '2 Adults',
      'Room Type': 'Deluxe Suite',
    }}
    actions={[
      {
        label: 'Edit',
        variant: 'light',
        onClick: handleEdit,
      },
      {
        label: 'Confirm',
        variant: 'filled',
        onClick: handleConfirm,
      },
    ]}
  />
</StepWrapper>
```

### Using the Hook Directly

```javascript
import { useStepNavigation } from '../hooks/useStepNavigation';

const MyComponent = () => {
  const stepNav = useStepNavigation(1, 5, {
    autoSave: true,
    autoSaveInterval: 30000,
  });

  const handleNext = async () => {
    const isValid = await stepNav.validateStep(1, validationSchema);
    if (isValid) {
      stepNav.goToNextStep();
    }
  };

  return (
    <div>
      <p>Step {stepNav.currentStep} of {stepNav.totalSteps}</p>
      <button onClick={handleNext}>Next</button>
      <button onClick={stepNav.goToPreviousStep}>Back</button>
    </div>
  );
};
```

## Configuration Options

### StepWrapper Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Step title |
| `subtitle` | string | - | Step subtitle |
| `stepNumber` | number | - | Current step number |
| `totalSteps` | number | - | Total number of steps |
| `showProgress` | boolean | false | Show progress bar |
| `enableStepNavigation` | boolean | false | Enable step navigation hook |
| `showBackButton` | boolean | true | Show back button |
| `showExitButton` | boolean | true | Show exit button |
| `showHomeButton` | boolean | false | Show home button |
| `showSettingsButton` | boolean | false | Show settings button |
| `childrenProps` | object | {} | Props to pass to children |
| `stepNavigationProps` | object | {} | Props for step navigation hook |

### StepForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | array | [] | Form fields configuration |
| `onSubmit` | function | - | Submit handler |
| `onSave` | function | - | Save handler |
| `autoSave` | boolean | true | Enable auto-save |
| `validationSchema` | object | - | Yup validation schema |

### StepDisplay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | 'info' | Display type (info, success, warning, error, confirmation) |
| `title` | string | - | Display title |
| `subtitle` | string | - | Display subtitle |
| `content` | string/array/function | - | Display content |
| `data` | object | {} | Data to display |
| `actions` | array | [] | Action buttons |

## Schema System

### Validation Schemas

```javascript
import { 
  validateStepNavigation, 
  validateStepWrapper, 
  validateButtonConfig 
} from '../schemas/stepSchema';

// Validate step navigation data
const stepData = {
  currentStep: 1,
  totalSteps: 5,
  stepData: {},
  isCompleted: false,
  canProceed: true,
};

try {
  await validateStepNavigation(stepData);
  console.log('Valid step navigation data');
} catch (error) {
  console.error('Validation errors:', error.errors);
}
```

### Default Values

```javascript
import { 
  createStepWrapperConfig, 
  createButtonConfig, 
  createLayoutConfig 
} from '../schemas/stepSchema';

// Create configuration with defaults
const wrapperConfig = createStepWrapperConfig({
  title: 'Custom Title',
  showProgress: true,
});

const buttonConfig = createButtonConfig({
  backButton: {
    text: 'Previous',
    color: '#C8653D',
  },
});
```

## Styling and Theming

### UNO Hotels Color Scheme

- **Primary**: `#C8653D` (UNO Orange)
- **Text**: `#0B152A` (Dark Navy)
- **Secondary**: `#777777` (Gray)
- **Background**: `#FFFFFF` (White)
- **Buttons**: `#E0E0E0` (Light Gray)

### Custom Styling

```javascript
<StepWrapper
  className="custom-step-wrapper"
  style={{
    backgroundColor: '#f8f9fa',
    borderRadius: '20px',
  }}
>
  <StepForm
    style={{
      padding: '20px',
      backgroundColor: '#ffffff',
    }}
  />
</StepWrapper>
```

## Advanced Features

### Auto-Save

The system includes automatic saving functionality:

```javascript
const stepNav = useStepNavigation(1, 5, {
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
});

// Data is automatically saved every 30 seconds
// and restored on page reload
```

### Validation

Comprehensive validation system:

```javascript
import * as yup from 'yup';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

<StepForm
  validationSchema={validationSchema}
  onSubmit={async (data) => {
    // Validation is automatically handled
    console.log('Valid data:', data);
  }}
/>
```

### Progress Tracking

```javascript
<StepWrapper
  stepNumber={3}
  totalSteps={5}
  showProgress={true}
>
  {/* Progress bar shows 60% complete */}
</StepWrapper>
```

## Best Practices

1. **Always use the StepWrapper** for consistent branding
2. **Enable auto-save** for better user experience
3. **Validate forms** before proceeding to next step
4. **Use appropriate display types** for different scenarios
5. **Handle errors gracefully** with proper error messages
6. **Test navigation flows** thoroughly
7. **Use semantic HTML** for accessibility

## Troubleshooting

### Common Issues

1. **StepWrapper not rendering children properly**
   - Ensure children are valid React elements
   - Check that childrenProps are passed correctly

2. **Auto-save not working**
   - Verify autoSave is enabled in stepNavigationProps
   - Check localStorage permissions

3. **Validation errors not showing**
   - Ensure validationSchema is properly configured
   - Check that error handling is implemented

4. **Navigation not working**
   - Verify enableStepNavigation is true
   - Check that stepNavigation hook is properly configured

### Debug Mode

```javascript
const stepNav = useStepNavigation(1, 5, {
  debug: true, // Enable debug logging
  autoSave: true,
});
```

## Migration Guide

### From Context to StepWrapper

```javascript
// Old way with Context
const { stepData, setStepData, goToNextStep } = useContext(StepContext);

// New way with StepWrapper
<StepWrapper enableStepNavigation={true}>
  <StepForm
    onSubmit={(data) => {
      // Data is automatically managed
      console.log('Form data:', data);
    }}
  />
</StepWrapper>
```

### From Custom Forms to StepForm

```javascript
// Old way
<form onSubmit={handleSubmit}>
  <input name="firstName" />
  <button type="submit">Submit</button>
</form>

// New way
<StepForm
  fields={[
    { name: 'firstName', type: 'text', label: 'First Name' }
  ]}
  onSubmit={handleSubmit}
/>
```

This comprehensive system provides everything needed for creating professional, branded multi-step forms and navigation flows in the UNO Hotels application.
