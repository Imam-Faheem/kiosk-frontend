import * as yup from 'yup';

// Step Navigation Schema
export const stepNavigationSchema = yup.object({
  currentStep: yup
    .number()
    .required('Current step is required')
    .min(1, 'Step must be at least 1')
    .max(10, 'Step cannot exceed 10'),
  totalSteps: yup
    .number()
    .required('Total steps is required')
    .min(1, 'Total steps must be at least 1')
    .max(10, 'Total steps cannot exceed 10'),
  stepData: yup.object().default({}),
  isCompleted: yup.boolean().default(false),
  canProceed: yup.boolean().default(true),
  validationErrors: yup.array().default([]),
});

// Step Wrapper Configuration Schema
export const stepWrapperConfigSchema = yup.object({
  title: yup.string().max(100, 'Title must be less than 100 characters'),
  subtitle: yup.string().max(200, 'Subtitle must be less than 200 characters'),
  showBackButton: yup.boolean().default(true),
  showExitButton: yup.boolean().default(true),
  showHomeButton: yup.boolean().default(false),
  showSettingsButton: yup.boolean().default(false),
  showProgress: yup.boolean().default(false),
  enableStepNavigation: yup.boolean().default(false),
  stepNumber: yup.number().min(1).max(10),
  totalSteps: yup.number().min(1).max(10),
  className: yup.string().max(50, 'Class name must be less than 50 characters'),
  childrenProps: yup.object().default({}),
  stepNavigationProps: yup.object().default({}),
  // Children integration props
  children: yup.mixed().required('Children component is required'),
  // Navigation function props
  onBack: yup.function(),
  onExit: yup.function(),
  onHome: yup.function(),
  onSettings: yup.function(),
  // Button text customization
  backButtonText: yup.string().default('Back'),
  exitButtonText: yup.string().default('Exit'),
  homeButtonText: yup.string().default('Home'),
  settingsButtonText: yup.string().default('Settings'),
});

// Button Configuration Schema
export const buttonConfigSchema = yup.object({
  backButton: yup.object({
    text: yup.string().default('Back'),
    icon: yup.string().default('IconArrowLeft'),
    color: yup.string().default('#C8653D'),
    variant: yup.string().default('filled'),
    size: yup.string().default('md'),
    disabled: yup.boolean().default(false),
  }),
  exitButton: yup.object({
    text: yup.string().default('Exit'),
    icon: yup.string().default('IconX'),
    color: yup.string().default('gray'),
    variant: yup.string().default('light'),
    size: yup.string().default('sm'),
    disabled: yup.boolean().default(false),
  }),
  homeButton: yup.object({
    text: yup.string().default('Home'),
    icon: yup.string().default('IconHome'),
    color: yup.string().default('#C8653D'),
    variant: yup.string().default('light'),
    size: yup.string().default('sm'),
    disabled: yup.boolean().default(false),
  }),
  settingsButton: yup.object({
    text: yup.string().default('Settings'),
    icon: yup.string().default('IconSettings'),
    color: yup.string().default('#C8653D'),
    variant: yup.string().default('light'),
    size: yup.string().default('sm'),
    disabled: yup.boolean().default(false),
  }),
});

// Layout Configuration Schema
export const layoutConfigSchema = yup.object({
  container: yup.object({
    size: yup.string().default('lg'),
    padding: yup.string().default('20px'),
    backgroundColor: yup.string().default('#f8f9fa'),
    minHeight: yup.string().default('100vh'),
  }),
  paper: yup.object({
    shadow: yup.string().default('md'),
    radius: yup.string().default('xl'),
    padding: yup.number().default(40),
    backgroundColor: yup.string().default('#ffffff'),
    maxWidth: yup.string().default('800px'),
  }),
  header: yup.object({
    logo: yup.object({
      backgroundColor: yup.string().default('#C8653D'),
      text: yup.string().default('UNO'),
      size: yup.string().default('40px'),
    }),
    title: yup.object({
      color: yup.string().default('#0B152A'),
      fontWeight: yup.string().default('700'),
      textTransform: yup.string().default('uppercase'),
    }),
  }),
  progress: yup.object({
    color: yup.string().default('#C8653D'),
    backgroundColor: yup.string().default('#E0E0E0'),
    height: yup.string().default('4px'),
    borderRadius: yup.string().default('2px'),
  }),
});

// Navigation Actions Schema
export const navigationActionsSchema = yup.object({
  onBack: yup.function(),
  onExit: yup.function(),
  onHome: yup.function(),
  onSettings: yup.function(),
  onNext: yup.function(),
  onPrevious: yup.function(),
  onFinish: yup.function(),
  onCancel: yup.function(),
});

// Children Integration Schema
export const childrenIntegrationSchema = yup.object({
  // Step navigation hook
  stepNavigation: yup.object().nullable(),
  // Navigation functions
  onBack: yup.function(),
  onExit: yup.function(),
  onHome: yup.function(),
  onSettings: yup.function(),
  // Step navigation methods
  goToNextStep: yup.function(),
  goToPreviousStep: yup.function(),
  goToStep: yup.function(),
  // Step data methods
  updateStepData: yup.function(),
  getStepData: yup.function(),
  clearStepData: yup.function(),
  getAllStepData: yup.function(),
  // Validation methods
  validateStep: yup.function(),
  isStepValid: yup.function(),
  areAllStepsValid: yup.function(),
  // State
  currentStep: yup.number(),
  totalSteps: yup.number(),
  progress: yup.number(),
  isCompleted: yup.boolean(),
  canProceed: yup.boolean(),
  errors: yup.object(),
  isLoading: yup.boolean(),
  // Navigation state
  canGoBack: yup.boolean(),
  canGoForward: yup.boolean(),
  isFirstStep: yup.boolean(),
  isLastStep: yup.boolean(),
  // Utilities
  reset: yup.function(),
  complete: yup.function(),
  clearSavedState: yup.function(),
  setIsLoading: yup.function(),
  setCanProceed: yup.function(),
  setIsCompleted: yup.function(),
});

// Step Data Schema
export const stepDataSchema = yup.object({
  stepId: yup.string().required('Step ID is required'),
  stepName: yup.string().required('Step name is required'),
  stepType: yup.string().oneOf(['form', 'display', 'confirmation', 'navigation']).required('Step type is required'),
  data: yup.object().default({}),
  validation: yup.object().default({}),
  navigation: yup.object().default({}),
  metadata: yup.object().default({}),
});

// Multi-step Form Schema
export const multiStepFormSchema = yup.object({
  formId: yup.string().required('Form ID is required'),
  formName: yup.string().required('Form name is required'),
  steps: yup.array().of(stepDataSchema).min(1, 'At least one step is required'),
  currentStep: yup.number().min(1).default(1),
  totalSteps: yup.number().min(1).required('Total steps is required'),
  isCompleted: yup.boolean().default(false),
  canProceed: yup.boolean().default(true),
  validationErrors: yup.array().default([]),
  autoSave: yup.boolean().default(true),
  autoSaveInterval: yup.number().default(30000), // 30 seconds
});

// Default Values
export const defaultStepValues = {
  stepNavigation: {
    currentStep: 1,
    totalSteps: 5,
    stepData: {},
    isCompleted: false,
    canProceed: true,
    validationErrors: [],
  },
  stepWrapper: {
    title: '',
    subtitle: '',
    showBackButton: true,
    showExitButton: true,
    showHomeButton: false,
    showSettingsButton: false,
    showProgress: false,
    enableStepNavigation: false,
    stepNumber: 1,
    totalSteps: 5,
    className: '',
    childrenProps: {},
    stepNavigationProps: {},
  },
  buttons: {
    backButton: {
      text: 'Back',
      icon: 'IconArrowLeft',
      color: '#C8653D',
      variant: 'filled',
      size: 'md',
      disabled: false,
    },
    exitButton: {
      text: 'Exit',
      icon: 'IconX',
      color: 'gray',
      variant: 'light',
      size: 'sm',
      disabled: false,
    },
    homeButton: {
      text: 'Home',
      icon: 'IconHome',
      color: '#C8653D',
      variant: 'light',
      size: 'sm',
      disabled: false,
    },
    settingsButton: {
      text: 'Settings',
      icon: 'IconSettings',
      color: '#C8653D',
      variant: 'light',
      size: 'sm',
      disabled: false,
    },
  },
  layout: {
    container: {
      size: 'lg',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    },
    paper: {
      shadow: 'md',
      radius: 'xl',
      padding: 40,
      backgroundColor: '#ffffff',
      maxWidth: '800px',
    },
    header: {
      logo: {
        backgroundColor: '#C8653D',
        text: 'UNO',
        size: '40px',
      },
      title: {
        color: '#0B152A',
        fontWeight: '700',
        textTransform: 'uppercase',
      },
    },
    progress: {
      color: '#C8653D',
      backgroundColor: '#E0E0E0',
      height: '4px',
      borderRadius: '2px',
    },
  },
  stepData: {
    stepId: '',
    stepName: '',
    stepType: 'form',
    data: {},
    validation: {},
    navigation: {},
    metadata: {},
  },
  multiStepForm: {
    formId: '',
    formName: '',
    steps: [],
    currentStep: 1,
    totalSteps: 5,
    isCompleted: false,
    canProceed: true,
    validationErrors: [],
    autoSave: true,
    autoSaveInterval: 30000,
  },
};

// Validation Functions
export const validateStepNavigation = (data) => {
  return stepNavigationSchema.validate(data, { abortEarly: false });
};

export const validateStepWrapper = (data) => {
  return stepWrapperConfigSchema.validate(data, { abortEarly: false });
};

export const validateButtonConfig = (data) => {
  return buttonConfigSchema.validate(data, { abortEarly: false });
};

export const validateLayoutConfig = (data) => {
  return layoutConfigSchema.validate(data, { abortEarly: false });
};

export const validateNavigationActions = (data) => {
  return navigationActionsSchema.validate(data, { abortEarly: false });
};

export const validateChildrenIntegration = (data) => {
  return childrenIntegrationSchema.validate(data, { abortEarly: false });
};

export const validateStepData = (data) => {
  return stepDataSchema.validate(data, { abortEarly: false });
};

export const validateMultiStepForm = (data) => {
  return multiStepFormSchema.validate(data, { abortEarly: false });
};

// Helper Functions
export const createStepWrapperConfig = (overrides = {}) => {
  return {
    ...defaultStepValues.stepWrapper,
    ...overrides,
  };
};

export const createButtonConfig = (overrides = {}) => {
  return {
    ...defaultStepValues.buttons,
    ...overrides,
  };
};

export const createLayoutConfig = (overrides = {}) => {
  return {
    ...defaultStepValues.layout,
    ...overrides,
  };
};

export const createStepData = (overrides = {}) => {
  return {
    ...defaultStepValues.stepData,
    ...overrides,
  };
};

export const createMultiStepForm = (overrides = {}) => {
  return {
    ...defaultStepValues.multiStepForm,
    ...overrides,
  };
};