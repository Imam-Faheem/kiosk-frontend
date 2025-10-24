import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  colors: {
    brand: [
      '#e7f5ff',
      '#d0ebff',
      '#a5d8ff',
      '#74c0fc',
      '#339af0',
      '#228be6',
      '#1c7ed6',
      '#1971c2',
      '#1864ab',
      '#0c5aa6',
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
          fontWeight: 500,
        },
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        size: 'md',
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
      },
    },
  },
  other: {
    // Custom properties
    hotelBrand: {
      primary: '#228be6',
      secondary: '#339af0',
      accent: '#74c0fc',
    },
  },
});
