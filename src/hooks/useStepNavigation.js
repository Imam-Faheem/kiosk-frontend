import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  validateStepNavigation, 
  validateStepData, 
  defaultStepValues 
} from '../schemas/stepSchema';

export const useStepNavigation = (initialStep = 1, totalSteps = 5, options = {}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepData, setStepData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [canProceed, setCanProceed] = useState(true);
  const autoSaveRef = useRef(null);
  
  // Configuration
  const config = {
    autoSave: options.autoSave !== false,
    autoSaveInterval: options.autoSaveInterval || 30000,
    validateOnChange: options.validateOnChange !== false,
    ...options,
  };

  // Navigation functions
  const goToStep = useCallback((stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
      setErrors({});
    }
  }, [totalSteps]);

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  }, [currentStep, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Data management
  const updateStepData = useCallback((stepNumber, data) => {
    setStepData(prev => ({
      ...prev,
      [stepNumber]: data,
    }));
  }, []);

  const getStepData = useCallback((stepNumber) => {
    return stepData[stepNumber] || {};
  }, [stepData]);

  const clearStepData = useCallback((stepNumber) => {
    setStepData(prev => {
      const newData = { ...prev };
      delete newData[stepNumber];
      return newData;
    });
  }, []);

  // Validation
  const validateStep = useCallback(async (stepNumber, validationSchema) => {
    const data = getStepData(stepNumber);
    
    try {
      if (validationSchema) {
        await validateStepData({ ...data, stepId: `step_${stepNumber}` });
      }
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[stepNumber];
        return newErrors;
      });
      
      setCanProceed(true);
      return true;
    } catch (error) {
      const validationErrors = error.inner ? error.inner.map(err => err.message) : [error.message];
      
      setErrors(prev => ({
        ...prev,
        [stepNumber]: validationErrors,
      }));
      
      setCanProceed(false);
      return false;
    }
  }, [getStepData]);

  const isStepValid = useCallback((stepNumber) => {
    return !errors[stepNumber] || errors[stepNumber].length === 0;
  }, [errors]);

  // Navigation state
  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < totalSteps;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // Progress calculation
  const progress = (currentStep / totalSteps) * 100;

  // Auto-save functionality
  useEffect(() => {
    if (!config.autoSave) return;

    const autoSave = () => {
      try {
        const saveData = {
          currentStep,
          stepData,
          isCompleted,
          canProceed,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('stepNavigation', JSON.stringify(saveData));
      } catch (error) {
        console.warn('Failed to auto-save step navigation:', error);
      }
    };

    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    autoSaveRef.current = setTimeout(autoSave, 1000);
    
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [currentStep, stepData, isCompleted, canProceed, config.autoSave]);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stepNavigation');
      if (saved) {
        const { 
          currentStep: savedStep, 
          stepData: savedData,
          isCompleted: savedCompleted,
          canProceed: savedCanProceed 
        } = JSON.parse(saved);
        
        if (savedStep && savedStep >= 1 && savedStep <= totalSteps) {
          setCurrentStep(savedStep);
          setStepData(savedData || {});
          setIsCompleted(savedCompleted || false);
          setCanProceed(savedCanProceed !== false);
        }
      }
    } catch (error) {
      console.warn('Failed to load saved step navigation:', error);
    }
  }, [totalSteps]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem('stepNavigation');
    } catch (error) {
      console.warn('Failed to clear saved state:', error);
    }
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setStepData({});
    setErrors({});
    setIsLoading(false);
    setIsCompleted(false);
    setCanProceed(true);
    clearSavedState();
  }, [initialStep, clearSavedState]);

  // Complete the entire process
  const complete = useCallback(() => {
    setIsCompleted(true);
    setCanProceed(false);
    clearSavedState();
  }, [clearSavedState]);

  // Get all step data
  const getAllStepData = useCallback(() => {
    return stepData;
  }, [stepData]);

  // Check if all steps are valid
  const areAllStepsValid = useCallback(() => {
    for (let i = 1; i <= totalSteps; i++) {
      if (!isStepValid(i)) {
        return false;
      }
    }
    return true;
  }, [totalSteps, isStepValid]);

  return {
    // State
    currentStep,
    totalSteps,
    stepData,
    isLoading,
    errors,
    progress,
    isCompleted,
    canProceed,
    
    // Navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    goBack,
    goHome,
    
    // Data management
    updateStepData,
    getStepData,
    clearStepData,
    getAllStepData,
    
    // Validation
    validateStep,
    isStepValid,
    areAllStepsValid,
    
    // Navigation state
    canGoBack,
    canGoForward,
    isFirstStep,
    isLastStep,
    
    // Utilities
    reset,
    complete,
    clearSavedState,
    setIsLoading,
    setCanProceed,
    setIsCompleted,
  };
};
