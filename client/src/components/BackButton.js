import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Box, Typography, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigation } from '../contexts/NavigationContext';
import { smartGoBack, debugNavigationState, enhancedSmartGoBack } from '../utils/navigationRecovery';

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
    // Debug current navigation state in development
    if (process.env.NODE_ENV === 'development') {
      debugNavigationState();
    }
    
    console.log('BackButton clicked', { 
      canGoBack, 
      fallbackRoute, 
      stackLength: navigationContext?.navigationStack?.length || 0,
      browserHistoryLength: window.history.length 
    });
    
    try {
      // First try custom navigation context
      const didNavigateBack = navigateBack(fallbackRoute);
      console.log('Custom navigate back result:', didNavigateBack);
      
      // If custom navigation failed, use enhanced smart recovery
      if (!didNavigateBack) {
        console.log('Custom navigation failed, using enhanced smart recovery...');
        enhancedSmartGoBack(navigate, fallbackRoute);
      }
    } catch (error) {
      console.error('Error in BackButton navigation:', error);
      // Ultimate fallback using enhanced smart recovery
      try {
        enhancedSmartGoBack(navigate, fallbackRoute);
      } catch (finalError) {
        console.error('Enhanced smart recovery failed, using final fallback:', finalError);
        navigate(fallbackRoute);
      }
    }
  };

  // Get previous location info for tooltip
  const previousLocation = getPreviousLocation();
  const hasCustomNavigation = navigationContext?.navigationStack?.length > 0;
  const hasBrowserHistory = window.history.length > 1;
  
  let tooltipText = 'Go back';
  if (hasCustomNavigation && previousLocation) {
    tooltipText = `Back to ${previousLocation.path}`;
  } else if (hasBrowserHistory) {
    tooltipText = 'Go back to previous page';
  } else {
    tooltipText = `Go back to ${fallbackRoute}`;
  }

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
