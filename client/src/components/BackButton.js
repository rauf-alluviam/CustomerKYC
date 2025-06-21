import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Box, Typography, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigation } from '../contexts/NavigationContext';

const BackButton = ({ 
  variant = 'icon', // 'icon', 'text', or 'both'
  color = '#ed6c02',
  size = 'medium',
  showText = false,
  customText = 'Back',
  fallbackRoute = '/customer-kyc',
  showHistoryIndicator = false,
  sx = {}
}) => {
  const navigate = useNavigate();
  
  // Always call the hook, but handle errors in the implementation
  const navigationContext = useNavigation();
  
  // Provide fallback values if navigation context is not working properly
  const navigateBack = navigationContext?.navigateBack || (() => false);
  const canGoBack = navigationContext?.canGoBack || false;
  const getPreviousLocation = navigationContext?.getPreviousLocation || (() => null);

  const handleBackClick = () => {
    console.log('BackButton clicked', { canGoBack, fallbackRoute });
    console.log('Navigation stack:', getPreviousLocation());
    
    try {
      const didNavigateBack = navigateBack(fallbackRoute);
      console.log('Navigate back result:', didNavigateBack);
      if (!didNavigateBack) {
        console.log('Using fallback navigation to:', fallbackRoute);
        // Fallback to browser history if navigation context failed
        navigate(-1);
      }
    } catch (error) {
      console.error('Error in BackButton navigation:', error);
      // Ultimate fallback
      navigate(fallbackRoute);
    }
  };

  // Get previous location info for tooltip
  const previousLocation = getPreviousLocation();
  const tooltipText = canGoBack && previousLocation 
    ? `Back to ${previousLocation.path}` 
    : 'Go back';

  const defaultStyles = {
    color: color,
    backgroundColor: canGoBack ? 'rgba(33, 113, 194, 0.1)' : 'rgba(107, 114, 128, 0.1)',
    '&:hover': {
      backgroundColor: canGoBack ? 'rgba(33, 113, 194, 0.2)' : 'rgba(107, 114, 128, 0.2)',
      transform: 'none',
    },
    transition: 'all 0.2s ease-in-out',
    boxShadow: canGoBack ? '0 1px 3px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
    opacity: canGoBack ? 1 : 0.7,
    ...sx
  };

  if (variant === 'text' || (variant === 'both' && showText)) {
    return (
      <Box
        onClick={handleBackClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '6px',
          ...defaultStyles,
          width: 'fit-content'
        }}
        title={tooltipText}
      >
        <ArrowBack fontSize={size} />
        <Typography variant="button" sx={{ fontWeight: 500 }}>
          {customText}
        </Typography>
        {showHistoryIndicator && canGoBack && (
          <Box 
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#2171c2',
              position: 'absolute',
              top: '50%',
              left: '10px',
              transform: 'translateY(-50%)',
              boxShadow: '0 0 4px rgba(33, 113, 194, 0.6)',
            }}
          />
        )}
      </Box>
    );
  }

  return (
    <Tooltip title={tooltipText} arrow>
      <IconButton 
        onClick={handleBackClick}
        size={size}
        sx={defaultStyles}
        aria-label="Go back to previous page"
      >
        <ArrowBack fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};

export default BackButton;
