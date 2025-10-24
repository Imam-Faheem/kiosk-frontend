import React from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Text,
  Anchor,
  DateInput,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUser, IconMail, IconPhone, IconCalendar } from '@tabler/icons-react';
import { registerSchema, defaultValues } from '../types/auth';

const RegisterForm = () => {
  const form = useForm({
    initialValues: defaultValues.register,
    validate: yupResolver(registerSchema),
  });

  const handleSubmit = async (values) => {
    try {
      // Simulate API call
      console.log('Registration data:', values);
      
      notifications.show({
        title: 'Success',
        message: 'Registration successful!',
        color: 'green',
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Registration failed. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack>
          <Title order={2} c="blue" fw={700} ta="center">
            Create Account
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Sign up to get started with your account
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="Enter your first name"
                  leftSection={<IconUser size={16} />}
                  required
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Enter your last name"
                  leftSection={<IconUser size={16} />}
                  required
                  {...form.getInputProps('lastName')}
                />
              </Group>

              <TextInput
                label="Email"
                placeholder="Enter your email"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps('email')}
              />

              <TextInput
                label="Phone"
                placeholder="Enter your phone number"
                leftSection={<IconPhone size={16} />}
                required
                {...form.getInputProps('phone')}
              />

              <DateInput
                label="Date of Birth"
                placeholder="Select your date of birth"
                leftSection={<IconCalendar size={16} />}
                required
                {...form.getInputProps('dateOfBirth')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                required
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                {...form.getInputProps('confirmPassword')}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                mt="md"
              >
                Create Account
              </Button>
            </Stack>
          </form>

          <Group justify="center" mt="md">
            <Text size="sm" c="dimmed">
              Already have an account?{' '}
              <Anchor href="/login" size="sm">
                Sign in
              </Anchor>
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default RegisterForm;
