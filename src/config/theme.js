import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: 'brand',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  colors: {
    brand: [
      '#fef2f2',
      '#fee2e2',
      '#fecaca',
      '#fca5a5',
      '#f87171',
      '#ef4444',
      '#dc2626',
      '#b91c1c',
      '#991b1b',
      '#7f1d1d',
    ],
    uno: [
      '#fef7f3',
      '#fdeee6',
      '#fbd9c7',
      '#f8c4a8',
      '#f5af89',
      '#f29a6a',
      '#ef854b',
      '#ec702c',
      '#d65b1a',
      '#c8653d',
    ],
  },
  primaryShade: { light: 6, dark: 8 },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          borderRadius: '12px',
        },
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        input: {
          borderRadius: '8px',
        },
      },
    },
    PasswordInput: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        input: {
          borderRadius: '8px',
        },
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
      },
    },
  },
  other: {
    // Custom properties
    hotelBrand: {
      primary: '#C8653D',
      secondary: '#B8552F',
      accent: '#F29A6A',
      background: '#FFFFFF',
      text: '#0B152A',
    },
  },
});
