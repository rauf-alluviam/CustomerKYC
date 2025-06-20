import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  // Initialize states from localStorage if available
  const [navigationStack, setNavigationStack] = useState([]);
  const [tabStates, setTabStates] = useState(() => {
    try {
      const saved = localStorage.getItem('kyc-tab-states');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [scrollPositions, setScrollPositions] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Persist tab states to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('kyc-tab-states', JSON.stringify(tabStates));
    } catch (error) {
      console.warn('Failed to save tab states to localStorage:', error);
    }
  }, [tabStates]);

  // Debug mode - expose navigation state to window for testing
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.navigationContext = {
        navigationStack,
        tabStates,
        canGoBack: navigationStack.length > 0
      };
    }
  }, [navigationStack, tabStates]);

  // Save the current tab state for a specific route
  const saveTabState = useCallback((route, tabIndex) => {
    setTabStates(prev => {
      const newStates = {
        ...prev,
        [route]: tabIndex
      };
      return newStates;
    });
  }, []);

  // Get the saved tab state for a route
  const getTabState = useCallback((route) => {
    return tabStates[route] || 0;
  }, [tabStates]);

  // Save scroll position for a route
  const saveScrollPosition = useCallback((route, position) => {
    setScrollPositions(prev => ({
      ...prev,
      [route]: position
    }));
  }, []);

  // Get saved scroll position for a route
  const getScrollPosition = useCallback((route) => {
    return scrollPositions[route] || 0;
  }, [scrollPositions]);

  // Navigate to a route and save current location as referrer
  const navigateWithRef = useCallback((to, options = {}) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const fullCurrentPath = currentPath + currentSearch;
    
    // Save current scroll position
    const scrollY = window.scrollY;
    saveScrollPosition(fullCurrentPath, scrollY);
    
    // Add current location to navigation stack
    setNavigationStack(prev => [...prev, {
      path: fullCurrentPath,
      timestamp: Date.now(),
      tabState: tabStates[currentPath] || 0,
      scrollPosition: scrollY
    }]);
    
    navigate(to, options);
  }, [location, navigate, saveScrollPosition, tabStates]);

  // Navigate back to the previous location with state restoration
  const navigateBack = useCallback((fallbackRoute = '/customer-kyc') => {
    if (navigationStack.length > 0) {
      const previousLocation = navigationStack[navigationStack.length - 1];
      
      // Remove the last entry from stack
      setNavigationStack(prev => prev.slice(0, -1));
      
      // Navigate to previous location
      navigate(previousLocation.path, { replace: false });
      
      // Restore scroll position after navigation
      setTimeout(() => {
        window.scrollTo(0, previousLocation.scrollPosition || 0);
      }, 100);
      
      return true;
    } else {
      // No previous location in stack, use fallback
      navigate(fallbackRoute);
      return false;
    }
  }, [navigationStack, navigate]);

  // Clear navigation stack (useful for logout or major route changes)
  const clearNavigationStack = useCallback(() => {
    setNavigationStack([]);
    setTabStates({});
    setScrollPositions({});
  }, []);

  // Check if there's a previous location to go back to
  const canGoBack = navigationStack.length > 0;

  // Get the previous location info without navigating
  const getPreviousLocation = useCallback(() => {
    if (navigationStack.length > 0) {
      return navigationStack[navigationStack.length - 1];
    }
    return null;
  }, [navigationStack]);

  const value = {
    navigateWithRef,
    navigateBack,
    clearNavigationStack,
    canGoBack,
    getPreviousLocation,
    saveTabState,
    getTabState,
    saveScrollPosition,
    getScrollPosition,
    navigationStack
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
