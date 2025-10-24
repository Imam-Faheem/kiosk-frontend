import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Center,
  Box,
  Group,
  Text,
  Anchor,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconLogin } from "@tabler/icons-react";
import { loginSchema, defaultValues } from "../types/auth";
import useAuthStore from "../stores/authStore";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const form = useForm({
    initialValues: defaultValues.login,
    validate: yupResolver(loginSchema),
  });

  const handleSubmit = async (values) => {
    try {
      clearError();
      await login(values);
      notifications.show({
        title: "Success",
        message: "Login successful!",
        color: "green",
      });
      navigate("/", { replace: true });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Login failed. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <Center h="100vh" bg="gray.0">
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Stack>
            <Box ta="center">
              <Title order={2} c="blue" fw={700}>
                Welcome Back
              </Title>
              <Text c="dimmed" size="sm" mt={5}>
                Sign in to your account to continue
              </Text>
            </Box>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Login Error"
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Username or Email"
                  placeholder="Enter your username or email"
                  required
                  {...form.getInputProps("username")}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  required
                  {...form.getInputProps("password")}
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  leftSection={<IconLogin size={16} />}
                  size="md"
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Group justify="center" mt="md">
              <Text size="sm" c="dimmed">
                Don't have an account?{" "}
                <Anchor href="#" size="sm">
                  Contact administrator
                </Anchor>
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Center>
  );
};

export default Login;