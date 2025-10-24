import React from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Stack,
  Text,
  Alert,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconMail, IconInfoCircle } from '@tabler/icons-react';
import { passwordResetSchema, defaultValues } from '../types/auth';

const PasswordResetForm = () => {
  const form = useForm({
    initialValues: defaultValues.passwordReset,
    validate: yupResolver(passwordResetSchema),
  });

  const handleSubmit = async (values) => {
    try {
      // Simulate API call
      console.log('Password reset request:', values);
      
      notifications.show({
        title: 'Success',
        message: 'Password reset link sent to your email!',
        color: 'green',
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send reset link. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack>
          <Title order={2} c="blue" fw={700} ta="center">
            Reset Password
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Enter your email to receive a password reset link
          </Text>

          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Password Reset"
            color="blue"
            variant="light"
          >
            We'll send you a secure link to reset your password. Check your email inbox.
          </Alert>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="Enter your email address"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps('email')}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                mt="md"
              >
                Send Reset Link
              </Button>
            </Stack>
          </form>

          <Text size="sm" c="dimmed" ta="center" mt="md">
            Remember your password?{' '}
            <a href="/login" style={{ color: 'var(--mantine-color-blue-6)' }}>
              Sign in
            </a>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PasswordResetForm;
