import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  DateInput,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUser, IconMail, IconPhone, IconCalendar } from '@tabler/icons-react';
import { profileUpdateSchema, defaultValues } from '../types/auth';

const ProfileUpdateForm = ({ user, onUpdate }) => {
  const form = useForm({
    initialValues: defaultValues.profileUpdate,
    validate: yupResolver(profileUpdateSchema),
  });

  // Populate form with user data
  useEffect(() => {
    if (user) {
      form.setValues({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      });
    }
  }, [user]);

  const handleSubmit = async (values) => {
    try {
      // Simulate API call
      console.log('Profile update data:', values);
      
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully!',
        color: 'green',
      });
      
      // Call parent callback if provided
      if (onUpdate) {
        onUpdate(values);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Container size={500} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack>
          <Title order={2} c="blue" fw={700} ta="center">
            Update Profile
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            Update your personal information
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

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  size="md"
                >
                  Update Profile
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ProfileUpdateForm;
