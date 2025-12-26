import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';
import { ArrowBack } from '@mui/icons-material';
import { enhancedSmartGoBack, debugNavigationState } from '../utils/navigationRecovery';

const BackButton = ({
  variant = 'icon', // 'icon', 'text', or 'both'
  color = '#ed6c02',
  size = 'medium',
  showText = false,
  customText = 'Back',
  fallbackRoute = '/customer-kyc',
  showHistoryIndicator = false,
  sx = {} // retained for props compatibility but ignored or mapped to style
}) => {
  const navigate = useNavigate();
  const navigationContext = useNavigation();

  const navigateBack = navigationContext?.navigateBack || (() => false);
  const canGoBack = navigationContext?.canGoBack || false;
  const getPreviousLocation = navigationContext?.getPreviousLocation || (() => null);

  const handleBackClick = () => {
    if (process.env.NODE_ENV === 'development') {
      debugNavigationState();
    }

    try {
      const didNavigateBack = navigateBack(fallbackRoute);
      if (!didNavigateBack) {
        enhancedSmartGoBack(navigate, fallbackRoute);
      }
    } catch (error) {
      console.error('Error in BackButton navigation:', error);
      enhancedSmartGoBack(navigate, fallbackRoute);
    }
  };

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

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: variant === 'icon' ? '0.5rem' : '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: color,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: canGoBack ? 1 : 0.8,
    ...sx // naive spread
  };

  return (
    <button
      onClick={handleBackClick}
      title={tooltipText}
      style={baseStyle}
      className={`btn-back ${variant === 'icon' ? 'icon-only' : ''}`}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.2)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)'}
    >
      <ArrowBack style={{ fontSize: size === 'medium' ? '1.25rem' : '1rem' }} />
      {(variant === 'text' || (variant === 'both' && showText)) && (
        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{customText}</span>
      )}
    </button>
  );
};

export default BackButton;
