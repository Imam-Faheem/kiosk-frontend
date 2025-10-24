import React from 'react';
import {
  Stack,
  Text,
  Title,
  Box,
  Group,
  Button,
  Card,
  Image,
  List,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import { 
  IconCheck, 
  IconX, 
  IconInfo, 
  IconAlertCircle,
  IconClock,
  IconUser,
  IconCalendar,
} from '@tabler/icons-react';

const StepDisplay = ({
  stepNavigation,
  onBack,
  onExit,
  onHome,
  onSettings,
  title,
  subtitle,
  content,
  data = {},
  type = 'info', // info, success, warning, error, confirmation
  showActions = true,
  actions = [],
  icon,
  image,
  list,
  ...props
}) => {
  const getTypeConfig = (type) => {
    const configs = {
      info: {
        color: 'blue',
        icon: IconInfo,
        bgColor: '#E3F2FD',
        borderColor: '#2196F3',
      },
      success: {
        color: 'green',
        icon: IconCheck,
        bgColor: '#E8F5E8',
        borderColor: '#4CAF50',
      },
      warning: {
        color: 'yellow',
        icon: IconAlertCircle,
        bgColor: '#FFF3E0',
        borderColor: '#FF9800',
      },
      error: {
        color: 'red',
        icon: IconX,
        bgColor: '#FFEBEE',
        borderColor: '#F44336',
      },
      confirmation: {
        color: 'blue',
        icon: IconInfo,
        bgColor: '#F3E5F5',
        borderColor: '#9C27B0',
      },
    };
    return configs[type] || configs.info;
  };

  const typeConfig = getTypeConfig(type);
  const TypeIcon = icon || typeConfig.icon;

  const renderContent = () => {
    if (typeof content === 'string') {
      return (
        <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
          {content}
        </Text>
      );
    }

    if (Array.isArray(content)) {
      return (
        <Stack gap="sm">
          {content.map((item, index) => (
            <Text key={index} size="md" c="dimmed">
              {item}
            </Text>
          ))}
        </Stack>
      );
    }

    if (typeof content === 'function') {
      return content(data);
    }

    return content;
  };

  const renderList = () => {
    if (!list) return null;

    return (
      <List
        spacing="sm"
        size="md"
        center
        icon={
          <ThemeIcon color={typeConfig.color} size={24} radius="xl">
            <TypeIcon size={16} />
          </ThemeIcon>
        }
      >
        {list.map((item, index) => (
          <List.Item key={index}>
            <Text size="md">{item}</Text>
          </List.Item>
        ))}
      </List>
    );
  };

  const renderData = () => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <Card
        withBorder
        p="md"
        style={{
          backgroundColor: typeConfig.bgColor,
          borderColor: typeConfig.borderColor,
        }}
      >
        <Stack gap="sm">
          {Object.entries(data).map(([key, value]) => (
            <Group key={key} justify="space-between">
              <Text fw={500} size="sm" c="dimmed">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </Text>
              <Text size="sm" fw={500}>
                {value}
              </Text>
            </Group>
          ))}
        </Stack>
      </Card>
    );
  };

  const renderActions = () => {
    if (!showActions || actions.length === 0) return null;

    return (
      <Group justify="center" mt="xl">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'filled'}
            color={action.color || '#C8653D'}
            size={action.size || 'md'}
            leftSection={action.icon}
            onClick={action.onClick}
            disabled={action.disabled}
            loading={action.loading}
            style={action.style}
          >
            {action.label}
          </Button>
        ))}
      </Group>
    );
  };

  return (
    <Box>
      <Stack gap="xl" align="center">
        {/* Header */}
        <Stack gap="md" align="center">
          {TypeIcon && (
            <ThemeIcon
              size={60}
              radius="xl"
              color={typeConfig.color}
              variant="light"
            >
              <TypeIcon size={30} />
            </ThemeIcon>
          )}

          {title && (
            <Title order={2} c="#0B152A" ta="center" fw={700}>
              {title}
            </Title>
          )}

          {subtitle && (
            <Text size="lg" c="dimmed" ta="center">
              {subtitle}
            </Text>
          )}
        </Stack>

        {/* Image */}
        {image && (
          <Box>
            <Image
              src={image.src}
              alt={image.alt || 'Display image'}
              height={image.height || 200}
              radius="md"
              style={{ maxWidth: '100%' }}
            />
          </Box>
        )}

        {/* Content */}
        <Box style={{ maxWidth: '600px', width: '100%' }}>
          {renderContent()}
        </Box>

        {/* List */}
        {renderList()}

        {/* Data Display */}
        {renderData()}

        {/* Actions */}
        {renderActions()}
      </Stack>
    </Box>
  );
};

export default StepDisplay;
