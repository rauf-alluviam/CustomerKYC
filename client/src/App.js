import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import { NavigationProvider } from "./contexts/NavigationContext";
import { UserContext } from "./contexts/UserContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { FileUploadQueueProvider } from "./contexts/FileUploadQueueContext";
import CustomerKyc from "./components/CustomerKyc";
import ViewCustomerKyc from "./components/ViewCustomerKyc";
import ReviseCustomerKyc from "./components/ReviseCustomerKyc";
import ViewCompletedKycDetails from "./components/ViewCompletedKycDetails";
import ViewDraftDetails from "./components/ViewDraftDetails";
import EditCompletedKyc from "./components/EditCompletedKyc";
import LoginPage from "./components/LoginPage";

// Create a minimal clean theme

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e3a8a", // Deep Enterprise Navy
      light: "#3b82f6",
      dark: "#172554",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#475569", // Slate Grey (Neutral for secondary actions)
      light: "#94a3b8",
      dark: "#1e293b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f6f8", // Light gray background for contrast against white cards
      paper: "#ffffff",
    },
    text: {
      primary: "#111827", // Almost black, high contrast
      secondary: "#64748b", // Slate text for labels
    },
    error: {
      main: "#d32f2f", // Standard signaling red
      light: "#ffebee",
    },
    warning: {
      main: "#ffecdcff", // Logistic Amber (Safety/Warning)
      light: "#fff3e0",
    },
    info: {
      main: "#0288d1",
      light: "#e1f5fe",
    },
    success: {
      main: "#2e7d32", // Darker green for readability
      light: "#edf7ed",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    // Slightly more compact line heights for data density
    fontSize: 13,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontWeight: 600, color: "#1e293b", fontSize: "2.2rem" },
    h2: { fontWeight: 600, color: "#1e293b", fontSize: "1.8rem" },
    h3: { fontWeight: 600, color: "#1e293b", fontSize: "1.5rem" },
    h4: { fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" },
    h5: { fontWeight: 600, color: "#1e293b" },
    h6: { fontWeight: 600, color: "#1e293b", fontSize: "1rem" },
    body1: { lineHeight: 1.5 },
    body2: { lineHeight: 1.5, color: "#64748b" },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 4, // Tighter radius = more professional/industrial feel
  },
  shadows: [
    "none",
    "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)", // Subtle
    "0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)", // Hover
    // ... keep standard MUI shadows or flatten them further for enterprise look
    "0 4px 12px rgba(0, 0, 0, 0.12)",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 2px 6px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.12)",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 2px 6px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.12)",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 2px 6px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.12)",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 2px 6px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.12)",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 2px 6px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.12)",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 2px 6px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.12)",
    "0 1px 3px rgba(0, 0, 0, 0.05)",
    "0 2px 6px rgba(0, 0, 0, 0.08)",
    "0 4px 12px rgba(0, 0, 0, 0.12)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "#f4f6f8", // Matches palette.background.default
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          color: "#1e293b",
          boxShadow: "0 1px 0px #e2e8f0", // Clean border instead of shadow
          borderRadius: "0",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          background: "transparent",
        },
      },
    },
    // COMPACT TABLE STYLES (New Addition for Logistics)
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 16px", // Compact padding
          borderBottom: "1px solid #e2e8f0",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#f8fafc", // Light gray header
          color: "#475569",
          textTransform: "uppercase",
          fontSize: "0.75rem",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small", // Dense by default
        margin: "dense",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            background: "#ffffff",
            borderRadius: "4px",
            "&:hover": {
              background: "#ffffff",
              borderColor: "#64748b",
            },
            "&.Mui-focused": {
              background: "#ffffff",
              boxShadow: "0 0 0 2px rgba(30, 58, 138, 0.1)", // Primary blue focus ring
            },
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          fontWeight: 600,
          padding: "6px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          },
        },
        contained: {
          background: "#1e3a8a",
          color: "#ffffff",
          "&:hover": {
            background: "#172554",
          },
        },
        outlined: {
          borderColor: "#cbd5e1",
          color: "#1e3a8a",
          "&:hover": {
            borderColor: "#1e3a8a",
            background: "#f1f5f9",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0", // Defined border
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minHeight: "48px",
          fontSize: "0.875rem",
          "&.Mui-selected": {
            color: "#1e3a8a",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          borderRadius: "4px",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "none",
        },
        indicator: {
          backgroundColor: "#1e3a8a",
          height: "3px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "4px", // Square chips for enterprise look
          fontWeight: 500,
          height: "24px", // Compact
        },
      },
    },
  },
});

function App() {
  const { user, isAuthenticated, logout } = React.useContext(UserContext);

  const handleLogout = () => {
    logout();
  };

  // If user is not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <NavigationProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <LoginPage />
          </SnackbarProvider>
        </ThemeProvider>
      </NavigationProvider>
    );
  }

  // If user is authenticated, show the main application
  return (
    <NavigationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <FileUploadQueueProvider>
            <Box
              sx={{
                flexGrow: 1,
                minHeight: "100vh",
                background: "#fffefe",
              }}
            >
              <AppBar
                position="static"
                elevation={0}
                sx={{
                  background: "#fffefe",
                  color: "#2171c2",
                  borderRadius: "0",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Toolbar sx={{ padding: "1rem 2rem" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      flexGrow: 1,
                      fontWeight: 600,
                      color: "#000000",
                    }}
                  >
                    Customer KYC Management System
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "#000000" }}>
                      Welcome, {user?.first_name || user?.username}
                    </Typography>
                    <IconButton
                      onClick={handleLogout}
                      sx={{
                        color: "#000000",
                        "&:hover": {
                          background: "rgba(0, 0, 0, 0.05)",
                        },
                      }}
                      title="Logout"
                    >
                      <LogoutOutlined />
                    </IconButton>
                  </Box>
                </Toolbar>
              </AppBar>

              <Container
                maxWidth="xxl"
                border="1px solid rgb(0, 0, 0)"
                sx={{
                  // bgcolor:"red",
                  mt: 3,
                  mb: 4,
                  px: { xs: 2, sm: 3, md: 4 },
                }}
              >
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/customer-kyc" replace />}
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/customer-kyc" element={<CustomerKyc />} />
                  <Route
                    path="/view-customer-kyc/:_id"
                    element={<ViewCustomerKyc />}
                  />
                  <Route
                    path="/revise-customer-kyc/:_id"
                    element={<ReviseCustomerKyc />}
                  />
                  <Route
                    path="/view-completed-kyc/:_id"
                    element={<ViewCompletedKycDetails />}
                  />
                  <Route
                    path="/view-draft-details/:_id"
                    element={<ViewDraftDetails />}
                  />
                  <Route
                    path="/edit-completed-kyc/:_id"
                    element={<EditCompletedKyc />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/customer-kyc" replace />}
                  />
                </Routes>
              </Container>
            </Box>
          </FileUploadQueueProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </NavigationProvider>
  );
}

export default App;
