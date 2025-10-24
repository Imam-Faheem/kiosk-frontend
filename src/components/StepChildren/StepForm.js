import React, { useState, useEffect } from 'react';
import {
  Stack,
  TextInput,
  Button,
  Group,
  Text,
  Alert,
  Box,
  Divider,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

const StepForm = ({
  stepNavigation,
  onBack,
  onExit,
  onHome,
  onSettings,
  formData = {},
  validationSchema,
  onSubmit,
  onSave,
  title,
  description,
  fields = [],
  showSaveButton = true,
  showSubmitButton = true,
  autoSave = true,
  ...props
}) => {
  const [formValues, setFormValues] = useState(formData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !stepNavigation) return;

    const autoSaveData = () => {
      if (Object.keys(formValues).length > 0) {
        stepNavigation.updateStepData(stepNavigation.currentStep, formValues);
        setLastSaved(new Date());
      }
    };

    const timeoutId = setTimeout(autoSaveData, 2000);
    return () => clearTimeout(timeoutId);
  }, [formValues, autoSave, stepNavigation]);

  // Load saved data on mount
  useEffect(() => {
    if (stepNavigation) {
      const savedData = stepNavigation.getStepData(stepNavigation.currentStep);
      if (Object.keys(savedData).length > 0) {
        setFormValues(savedData);
      }
    }
  }, [stepNavigation]);

  const handleFieldChange = (fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  const validateForm = async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formValues);
      }
      if (stepNavigation) {
        stepNavigation.updateStepData(stepNavigation.currentStep, formValues);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formValues);
      }
      if (stepNavigation) {
        stepNavigation.updateStepData(stepNavigation.currentStep, formValues);
        stepNavigation.goToNextStep();
      }
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const { name, type, label, placeholder, required, options, ...fieldProps } = field;
    const value = formValues[name] || '';
    const error = errors[name];

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <TextInput
            key={name}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            error={error}
            required={required}
            type={type}
            {...fieldProps}
          />
        );
      
      case 'textarea':
        return (
          <TextInput
            key={name}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            error={error}
            required={required}
            multiline
            rows={4}
            {...fieldProps}
          />
        );
      
      case 'select':
        return (
          <TextInput
            key={name}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            error={error}
            required={required}
            {...fieldProps}
          />
        );
      
      default:
        return (
          <TextInput
            key={name}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            error={error}
            required={required}
            {...fieldProps}
          />
        );
    }
  };

  return (
    <Box>
      {(title || description) && (
        <Stack gap="md" mb="xl">
          {title && (
            <Text size="xl" fw={600} c="#0B152A">
              {title}
            </Text>
          )}
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </Stack>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {fields.map(renderField)}
          
          {Object.keys(errors).length > 0 && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Please fix the following errors:"
              color="red"
              variant="light"
            >
              <Stack gap="xs">
                {Object.entries(errors).map(([field, error]) => (
                  <Text key={field} size="sm">
                    • {error}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          {lastSaved && (
            <Alert
              icon={<IconCheck size={16} />}
              title="Auto-saved"
              color="green"
              variant="light"
            >
              Last saved: {lastSaved.toLocaleTimeString()}
            </Alert>
          )}

          <Divider />

          <Group justify="space-between">
            <Group>
              {showSaveButton && (
                <Button
                  variant="light"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSubmitting}
                >
                  Save Progress
                </Button>
              )}
            </Group>

            <Group>
              {showSubmitButton && (
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSaving}
                  style={{
                    backgroundColor: '#C8653D',
                    color: '#FFFFFF',
                  }}
                >
                  Continue
                </Button>
              )}
            </Group>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};

export default StepForm;
