import React from 'react';
import {
  Container,
  Paper,
  Title,
  PasswordInput,
  Button,
  Stack,
  Text,
  Alert,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';
import { changePasswordSchema, defaultValues } from '../types/auth';

const ChangePasswordForm = ({ onPasswordChange }) => {
  const form = useForm({
    initialValues: defaultValues.changePassword,
    validate: yupResolver(changePasswordSchema),
  });

  const handleSubmit = async (values) => {
    try {
      // Simulate API call
      console.log('Password change data:', values);
      
      notifications.show({
        title: 'Success',
        message: 'Password changed successfully!',
        color: 'green',
      });
      
      // Reset form
      form.reset();
      
      // Call parent callback if provided
      if (onPasswordChange) {
        onPasswordChange();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to change password. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack>
          <Title order={2} c="blue" fw={700} ta="center">
            Change Password
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Update your password to keep your account secure
          </Text>

          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Password Requirements"
            color="blue"
            variant="light"
          >
            Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
          </Alert>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <PasswordInput
                label="Current Password"
                placeholder="Enter your current password"
                leftSection={<IconLock size={16} />}
                required
                {...form.getInputProps('currentPassword')}
              />

              <PasswordInput
                label="New Password"
                placeholder="Enter your new password"
                leftSection={<IconLock size={16} />}
                required
                {...form.getInputProps('newPassword')}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm your new password"
                leftSection={<IconLock size={16} />}
                required
                {...form.getInputProps('confirmNewPassword')}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                mt="md"
              >
                Change Password
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ChangePasswordForm;
