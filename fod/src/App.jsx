import "./App.css";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { useSelector } from "react-redux";
import AppRoutes from "./app/routes";

// Re-maps every theme token → CSS variable so the whole UI reacts to theme changes
const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary:        ${({ theme }) => theme.colors.primary};
    --color-primary-light:  ${({ theme }) => theme.colors.primaryLight};
    --color-primary-dark:   ${({ theme }) => theme.colors.primaryDark};
    --color-primary-50:     ${({ theme }) => theme.colors.primary50};
    --color-primary-100:    ${({ theme }) => theme.colors.primary100};

    --color-bg:             ${({ theme }) => theme.colors.bg};
    --color-surface:        ${({ theme }) => theme.colors.surface};
    --color-border:         ${({ theme }) => theme.colors.border};
    --color-border-light:   ${({ theme }) => theme.colors.border};

    --color-text-primary:   ${({ theme }) => theme.colors.text};
    --color-text-secondary: ${({ theme }) => theme.colors.textMuted};
    --color-text-muted:     ${({ theme }) => theme.colors.grayLight};
    --color-text-disabled:  ${({ theme }) => theme.colors.grayLight};

    --color-success:        ${({ theme }) => theme.colors.success};
    --color-warning:        ${({ theme }) => theme.colors.warning};
    --color-error:          ${({ theme }) => theme.colors.error};
    --color-info:           ${({ theme }) => theme.colors.info};

    --shadow-xs: ${({ theme }) => theme.shadows.xs};
    --shadow-sm: ${({ theme }) => theme.shadows.sm};
    --shadow-md: ${({ theme }) => theme.shadows.md};
    --shadow-lg: ${({ theme }) => theme.shadows.lg};
    --shadow-xl: ${({ theme }) => theme.shadows.xl};
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

const App = () => {
  const theme = useSelector((state) => state.themeSlice.theme);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
