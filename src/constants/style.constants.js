// Color constants
export const COLORS = {
  primary: "#C8653D",
  primaryHover: "#B8552F",
  white: "#FFFFFF",
  gray: {
    0: "#F8F9FA",
    4: "#CED4DA",
    6: "#868E96",
  },
  border: "#E9ECEF",
};

// Border radius constants
export const BORDER_RADIUS = {
  small: 12,
  medium: 20,
  large: 24,
};

// Button styles
export const buttonStyles = {
  base: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    borderRadius: `${BORDER_RADIUS.medium}px`,
    padding: "20px 80px",
    fontWeight: "bold",
    fontSize: "18px",
    textTransform: "uppercase",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
    transition: "all 0.3s ease",
    border: "none",
  },
  hover: {
    transform: "scale(1.02)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
    backgroundColor: COLORS.primaryHover,
  },
  normal: {
    transform: "scale(1)",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
    backgroundColor: COLORS.primary,
  },
};

export const getPrimaryButtonStyles = (theme) => ({
  root: {
    backgroundColor: COLORS.primary,
    color: theme.white,
    borderRadius: BORDER_RADIUS.medium,
    fontSize: 18,
    border: "none",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
    transition: "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
    "&:hover": {
      backgroundColor: COLORS.primaryHover,
      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
      transform: "scale(1.02)",
    },
    "&:disabled": {
      backgroundColor: theme.colors.gray[4],
      color: theme.colors.gray[6],
      transform: "none",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
    },
    "&[data-disabled]": {
      backgroundColor: theme.colors.gray[4],
      color: theme.colors.gray[6],
      transform: "none",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
    },
  },
});

export const getInputStyles = () => ({
  input: {
    borderRadius: BORDER_RADIUS.small,
    fontSize: 16,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },
});
