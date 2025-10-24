import React, { useState } from 'react';
import {
  Container,
  Tabs,
  Title,
  Text,
  Stack,
  Group,
  Button,
} from '@mantine/core';
import { IconLogin, IconUserPlus, IconLock, IconUser } from '@tabler/icons-react';
import Login from './Login';
import RegisterForm from '../components/RegisterForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import PasswordResetForm from '../components/PasswordResetForm';
import ProfileUpdateForm from '../components/ProfileUpdateForm';

const AuthExamples = () => {
  const [activeTab, setActiveTab] = useState('login');

  // Mock user data for profile update
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
  };

  const handleProfileUpdate = (updatedData) => {
    console.log('Profile updated:', updatedData);
    // Handle profile update logic here
  };

  const handlePasswordChange = () => {
    console.log('Password changed successfully');
    // Handle password change logic here
  };

  return (
    <Container size="lg" my={40}>
      <Stack>
        <Title order={1} c="blue" fw={700} ta="center">
          Authentication Examples
        </Title>
        <Text c="dimmed" size="lg" ta="center">
          Examples of using auth schemas with Mantine forms
        </Text>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="login" leftSection={<IconLogin size={16} />}>
              Login
            </Tabs.Tab>
            <Tabs.Tab value="register" leftSection={<IconUserPlus size={16} />}>
              Register
            </Tabs.Tab>
            <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
              Profile Update
            </Tabs.Tab>
            <Tabs.Tab value="password" leftSection={<IconLock size={16} />}>
              Change Password
            </Tabs.Tab>
            <Tabs.Tab value="reset" leftSection={<IconLock size={16} />}>
              Reset Password
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login" pt="md">
            <Login />
          </Tabs.Panel>

          <Tabs.Panel value="register" pt="md">
            <RegisterForm />
          </Tabs.Panel>

          <Tabs.Panel value="profile" pt="md">
            <ProfileUpdateForm 
              user={mockUser} 
              onUpdate={handleProfileUpdate}
            />
          </Tabs.Panel>

          <Tabs.Panel value="password" pt="md">
            <ChangePasswordForm 
              onPasswordChange={handlePasswordChange}
            />
          </Tabs.Panel>

          <Tabs.Panel value="reset" pt="md">
            <PasswordResetForm />
          </Tabs.Panel>
        </Tabs>

        <Group justify="center" mt="xl">
          <Button
            variant="outline"
            onClick={() => setActiveTab('login')}
          >
            Back to Login
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default AuthExamples;
