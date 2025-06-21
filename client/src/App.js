import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import { NavigationProvider } from './contexts/NavigationContext';
import { UserContext } from './contexts/UserContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import CustomerKyc from './components/CustomerKyc';
import ViewCustomerKyc from './components/ViewCustomerKyc';
import ReviseCustomerKyc from './components/ReviseCustomerKyc';
import ViewCompletedKycDetails from './components/ViewCompletedKycDetails';
import ViewDraftDetails from './components/ViewDraftDetails';
import EditCompletedKyc from './components/EditCompletedKyc';
import LoginPage from './components/LoginPage';

// Create a minimal clean theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2171c2', // Primary blue
      light: '#4a90e2',
      dark: '#1859a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e87538', // Accent orange
      light: '#ff9800',
      dark: '#d86030',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fffefe', // Background white
      paper: '#fffefe',
    },
    text: {
      primary: '#000000', // Primary text black
      secondary: '#6b7280',
    },
    error: {
      main: '#e87538',
      light: '#fff5f5',
    },
    warning: {
      main: '#e87538',
      light: '#fff9f6',
    },
    info: {
      main: '#2171c2',
      light: '#f0f9ff',
    },
    success: {
      main: '#10b981',
      light: '#f0fdf4',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontWeight: 600,
      color: '#000000',
    },
    h2: {
      fontWeight: 600,
      color: '#000000',
    },
    h3: {
      fontWeight: 600,
      color: '#000000',
    },
    h4: {
      fontWeight: 600,
      color: '#000000',
      marginBottom: '1rem',
    },
    h5: {
      fontWeight: 500,
      color: '#000000',
    },
    h6: {
      fontWeight: 500,
      color: '#000000',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 6,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.12)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#fffefe',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#fffefe',
          color: '#000000',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderRadius: '0',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          background: 'transparent',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: '#fffefe',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            '&:hover': {
              background: '#fffefe',
              borderColor: '#9ca3af',
              boxShadow: 'none',
            },
            '&.Mui-focused': {
              background: '#fffefe',
              borderColor: '#2171c2',
              boxShadow: '0 0 0 3px rgba(33, 113, 194, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6b7280',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#2171c2',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          },
        },
        contained: {
          background: '#2171c2',
          color: '#ffffff',
          '&:hover': {
            background: '#1859a3',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
            transform: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            background: '#f9fafb',
          },
          '&.Mui-selected': {
            background: '#fffefe',
            color: '#2171c2',
            borderRadius: '6px',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          background: '#fffefe',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          '& .MuiTabs-indicator': {
            display: 'none',
          },
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
        <Box 
          sx={{ 
            flexGrow: 1,
            minHeight: '100vh',
            background: '#fffefe',
          }}
        >
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: '#fffefe',
            color: '#2171c2',
            borderRadius: '0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Toolbar sx={{ padding: '1rem 2rem' }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 600,
                color: '#000000',
              }}
            >
              Customer KYC Management System
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#000000' }}>
                Welcome, {user?.first_name || user?.username}
              </Typography>
              <IconButton 
                onClick={handleLogout}
                sx={{ 
                  color: '#000000',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.05)',
                  }
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
            <Route path="/" element={<Navigate to="/customer-kyc" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/customer-kyc" element={<CustomerKyc />} />
            <Route path="/view-customer-kyc/:_id" element={<ViewCustomerKyc />} />
            <Route path="/revise-customer-kyc/:_id" element={<ReviseCustomerKyc />} />
            <Route path="/view-completed-kyc/:_id" element={<ViewCompletedKycDetails />} />
            <Route path="/view-draft-details/:_id" element={<ViewDraftDetails />} />
            <Route path="/edit-completed-kyc/:_id" element={<EditCompletedKyc />} />
            <Route path="*" element={<Navigate to="/customer-kyc" replace />} />
          </Routes>
        </Container>
      </Box>
      </SnackbarProvider>
    </ThemeProvider>
    </NavigationProvider>
  );
}

export default App;
