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

// Create a modern theme with light and soft aesthetics
const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(237, 108, 2)', // Primary orange
      light: 'rgba(243, 163, 16, 0.3)',
      dark: 'rgb(200, 85, 0)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'rgb(160, 160, 160)',
      light: '#f5f5f5',
      dark: '#9e9e9e',
      contrastText: '#2c3e50',
    },
    background: {
      default: 'rgb(255, 254, 254)', // Light mint background
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#6c757d',
    },
    error: {
      main: '#d32f2f',
      light: '#ffebee',
    },
    warning: {
      main: '#f57c00',
      light: '#fff3e0',
    },
    info: {
      main: '#1976d2',
      light: '#e3f2fd',
    },
    success: {
      main: '#2e7d32',
      light: '#f1f8e9',
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
      color: '#2c3e50',
    },
    h2: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h3: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h4: {
      fontWeight: 600,
      color: '#2c3e50',
      marginBottom: '1rem',
    },
    h5: {
      fontWeight: 500,
      color: '#2c3e50',
    },
    h6: {
      fontWeight: 500,
      color: '#2c3e50',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
    '0 2px 12px rgba(0, 0, 0, 0.08)',
    '0 4px 20px rgba(0, 0, 0, 0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.16)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'rgb(236, 253, 245)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          borderRadius: '0 0 16px 16px',
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
        variant: 'filled',
        size: 'small',
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          '& .MuiFilledInput-root': {
            background: 'linear-gradient(145deg, #f8f9fa, #ffffff)',
            borderRadius: '12px',
            border: '1px solid rgba(243, 163, 16, 0.2)',
            '&:before': {
              display: 'none',
            },
            '&:after': {
              display: 'none',
            },
            '&:hover': {
              background: '#ffffff',
              borderColor: 'rgba(243, 163, 16, 0.4)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            },
            '&.Mui-focused': {
              background: '#ffffff',
              borderColor: 'rgb(237, 108, 2)',
              boxShadow: '0 0 0 3px rgba(237, 108, 2, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6c757d',
            fontWeight: 500,
            '&.Mui-focused': {
              color: 'rgb(237, 108, 2)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '12px 24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, rgb(237, 108, 2) 0%, rgba(243, 163, 16, 0.94) 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(243, 163, 16, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(243, 163, 16, 0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            background: '#fff3e0',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
            color: '#ffffff',
            borderRadius: '12px',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(243, 163, 16, 0.1)',
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
            background: 'rgb(223, 226, 197)',
          }}
        >
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
            borderRadius: '0 0 16px 16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Toolbar sx={{ padding: '1rem 2rem' }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 600,
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              Customer KYC Management System
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                Welcome, {user?.first_name || user?.username}
              </Typography>
              <IconButton 
                onClick={handleLogout}
                sx={{ 
                  color: '#ffffff',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
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
