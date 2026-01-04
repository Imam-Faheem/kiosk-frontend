import React from 'react';
import { Container, Paper, Stack, Text, Button, Title, Alert } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="lg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <Paper withBorder shadow="md" p={40} radius="xl" style={{ maxWidth: '600px', width: '100%' }}>
            <Stack gap="md" align="center">
              <IconAlertCircle size={64} color="#dc3545" />
              <Title order={2} c="red">Something went wrong</Title>
              <Alert icon={<IconAlertCircle size={16} />} title="Application Error" color="red" variant="light">
                <Text size="sm" mb="md">
                  The application encountered an unexpected error. Please try reloading the page.
                </Text>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details style={{ marginTop: '10px', fontSize: '12px' }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>Error Details (Development Only)</summary>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px' }}>
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </Alert>
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={this.handleReload}
                size="lg"
                color="red"
                variant="filled"
              >
                Reload Application
              </Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

