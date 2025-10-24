# Auth Schema Usage Guide

This guide shows how to use the authentication schemas in your hotel frontend project.

## 📁 Schema Location

The auth schemas are located in: `src/types/auth.js`

## 🔧 Available Schemas

### 1. **Login Schema** (`loginSchema`)
```javascript
import { loginSchema, defaultValues } from '../types/auth';

const form = useForm({
  initialValues: defaultValues.login,
  validate: yupResolver(loginSchema),
});
```

**Fields:**
- `username` - Username or email (required, 3-50 characters)
- `password` - Password (required, 6-100 characters)

### 2. **Registration Schema** (`registerSchema`)
```javascript
import { registerSchema, defaultValues } from '../types/auth';

const form = useForm({
  initialValues: defaultValues.register,
  validate: yupResolver(registerSchema),
});
```

**Fields:**
- `firstName` - First name (required, 2-50 characters)
- `lastName` - Last name (required, 2-50 characters)
- `email` - Email address (required, valid email format)
- `password` - Password (required, 8+ characters with complexity)
- `confirmPassword` - Password confirmation (must match password)
- `phone` - Phone number (required, valid phone format)
- `dateOfBirth` - Date of birth (required, valid date)

### 3. **Password Reset Schema** (`passwordResetSchema`)
```javascript
import { passwordResetSchema, defaultValues } from '../types/auth';

const form = useForm({
  initialValues: defaultValues.passwordReset,
  validate: yupResolver(passwordResetSchema),
});
```

**Fields:**
- `email` - Email address (required, valid email format)

### 4. **New Password Schema** (`newPasswordSchema`)
```javascript
import { newPasswordSchema, defaultValues } from '../types/auth';

const form = useForm({
  initialValues: defaultValues.newPassword,
  validate: yupResolver(newPasswordSchema),
});
```

**Fields:**
- `password` - New password (required, 8+ characters with complexity)
- `confirmPassword` - Password confirmation (must match password)

### 5. **Profile Update Schema** (`profileUpdateSchema`)
```javascript
import { profileUpdateSchema, defaultValues } from '../types/auth';

const form = useForm({
  initialValues: defaultValues.profileUpdate,
  validate: yupResolver(profileUpdateSchema),
});
```

**Fields:**
- `firstName` - First name (required, 2-50 characters)
- `lastName` - Last name (required, 2-50 characters)
- `email` - Email address (required, valid email format)
- `phone` - Phone number (required, valid phone format)
- `dateOfBirth` - Date of birth (required, valid date)

### 6. **Change Password Schema** (`changePasswordSchema`)
```javascript
import { changePasswordSchema, defaultValues } from '../types/auth';

const form = useForm({
  initialValues: defaultValues.changePassword,
  validate: yupResolver(changePasswordSchema),
});
```

**Fields:**
- `currentPassword` - Current password (required)
- `newPassword` - New password (required, 8+ characters with complexity)
- `confirmNewPassword` - New password confirmation (must match new password)

## 🚀 Usage Examples

### Basic Form Setup
```javascript
import React from 'react';
import { useForm, yupResolver } from '@mantine/form';
import { loginSchema, defaultValues } from '../types/auth';

const MyForm = () => {
  const form = useForm({
    initialValues: defaultValues.login,
    validate: yupResolver(loginSchema),
  });

  const handleSubmit = (values) => {
    console.log('Form data:', values);
    // Handle form submission
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### With Mantine Components
```javascript
import { TextInput, PasswordInput, Button } from '@mantine/core';

const LoginForm = () => {
  const form = useForm({
    initialValues: defaultValues.login,
    validate: yupResolver(loginSchema),
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="Username"
        placeholder="Enter username or email"
        {...form.getInputProps('username')}
      />
      
      <PasswordInput
        label="Password"
        placeholder="Enter password"
        {...form.getInputProps('password')}
      />
      
      <Button type="submit">Login</Button>
    </form>
  );
};
```

### With Notifications
```javascript
import { notifications } from '@mantine/notifications';

const handleSubmit = async (values) => {
  try {
    // API call
    await api.login(values);
    
    notifications.show({
      title: 'Success',
      message: 'Login successful!',
      color: 'green',
    });
  } catch (error) {
    notifications.show({
      title: 'Error',
      message: 'Login failed. Please try again.',
      color: 'red',
    });
  }
};
```

## 📋 Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Email Validation
- Valid email format
- Maximum 100 characters

### Phone Validation
- International format supported
- Pattern: `^\+?[\d\s\-\(\)]+$`

### Date Validation
- Date of birth cannot be in the future
- Must be after 1900

## 🎯 Best Practices

### 1. **Use Default Values**
```javascript
const form = useForm({
  initialValues: defaultValues.login, // Always use default values
  validate: yupResolver(loginSchema),
});
```

### 2. **Handle Form Reset**
```javascript
const handleSubmit = (values) => {
  // Process form data
  form.reset(); // Reset form after successful submission
};
```

### 3. **Custom Validation Messages**
```javascript
const customSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});
```

### 4. **Conditional Validation**
```javascript
const form = useForm({
  initialValues: { ...defaultValues.register },
  validate: yupResolver(registerSchema),
  validateInputOnChange: true, // Real-time validation
});
```

## 🔄 Integration with Stores

### With Zustand Store
```javascript
import useAuthStore from '../stores/authStore';

const LoginForm = () => {
  const { login, isLoading } = useAuthStore();
  
  const handleSubmit = async (values) => {
    await login(values);
  };
  
  // Form implementation
};
```

### With API Client
```javascript
import { api } from '../services/api/apiClient';

const handleSubmit = async (values) => {
  try {
    const response = await api.auth.login(values);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 📱 Example Components

Check out these example components that use the auth schemas:

- `src/pages/Login.js` - Login form
- `src/components/RegisterForm.js` - Registration form
- `src/components/ProfileUpdateForm.js` - Profile update form
- `src/components/ChangePasswordForm.js` - Change password form
- `src/components/PasswordResetForm.js` - Password reset form
- `src/pages/AuthExamples.js` - All examples in one page

## 🚀 Getting Started

1. Import the schema you need:
   ```javascript
   import { loginSchema, defaultValues } from '../types/auth';
   ```

2. Set up your form:
   ```javascript
   const form = useForm({
     initialValues: defaultValues.login,
     validate: yupResolver(loginSchema),
   });
   ```

3. Use with Mantine components:
   ```javascript
   <TextInput {...form.getInputProps('username')} />
   ```

4. Handle form submission:
   ```javascript
   <form onSubmit={form.onSubmit(handleSubmit)}>
   ```

That's it! Your forms will now have comprehensive validation with user-friendly error messages. 🎉
