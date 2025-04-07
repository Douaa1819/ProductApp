import { MD3LightTheme, configureFonts } from "react-native-paper"
import { DefaultTheme as NavigationDefaultTheme } from "@react-navigation/native"

const fontConfig = {
  fontFamily: "System",
}

export const COLORS = {
  primary: "#5C6BC0", 
  primaryLight: "#8E99F3",
  primaryDark: "#26418F",
  secondary: "#FF8A65", 
  secondaryLight: "#FFB993",
  secondaryDark: "#C75B39",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  error: "#CF6679",
  text: "#1E1E2D",
  textSecondary: "#78789D",
  border: "#E2E8F0",
  disabled: "#BDBDBD",
  placeholder: "#9E9E9E",
  backdrop: "rgba(0, 0, 0, 0.5)",
  success: "#4CAF50",
  warning: "#FFC107",
  info: "#2196F3",
}

export const theme = {
  ...MD3LightTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: COLORS.primary,
    primaryContainer: COLORS.primaryLight,
    secondary: COLORS.secondary,
    secondaryContainer: COLORS.secondaryLight,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.error,
    text: COLORS.text,
    onSurface: COLORS.text,
    disabled: COLORS.disabled,
    placeholder: COLORS.placeholder,
    backdrop: COLORS.backdrop,
  },
  fonts: configureFonts({ config: fontConfig }),
}

