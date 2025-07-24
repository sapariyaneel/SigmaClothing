import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook for responsive behavior
 * Provides breakpoint utilities and responsive values
 */
export const useResponsive = () => {
  const theme = useTheme();
  
  // Breakpoint queries - Updated to match requirements
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // ≤640px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 641px–1024px
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 1025px–1280px
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg')); // 1281px+
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // ≥1025px
  
  // Utility functions
  const getResponsiveValue = (mobileValue, tabletValue, desktopValue) => {
    if (isMobile) return mobileValue;
    if (isTablet) return tabletValue || mobileValue;
    return desktopValue || tabletValue || mobileValue;
  };

  const getSpacing = (mobile = 2, tablet = 3, desktop = 4) => {
    return getResponsiveValue(mobile, tablet, desktop);
  };

  const getFontSize = (mobile = '0.875rem', tablet = '1rem', desktop = '1.125rem') => {
    return getResponsiveValue(mobile, tablet, desktop);
  };

  const getGridColumns = (mobile = 1, tablet = 2, desktop = 3) => {
    return getResponsiveValue(mobile, tablet, desktop);
  };

  const getButtonSize = () => {
    return getResponsiveValue('medium', 'medium', 'large');
  };

  const getDialogMaxWidth = () => {
    return isMobile ? false : 'md';
  };

  const getContainerPadding = () => ({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4
  });

  const getResponsiveSpacing = () => ({
    xs: 2,
    sm: 3,
    md: 4
  });

  return {
    // Breakpoint flags
    isMobile,
    isTablet,
    isSmallDesktop,
    isLargeDesktop,
    isDesktop,
    
    // Utility functions
    getResponsiveValue,
    getSpacing,
    getFontSize,
    getGridColumns,
    getButtonSize,
    getDialogMaxWidth,
    getContainerPadding,
    getResponsiveSpacing,
    
    // Theme breakpoints for direct use
    breakpoints: theme.breakpoints,
  };
};

/**
 * Hook for responsive table behavior
 */
export const useResponsiveTable = () => {
  const { isMobile, isTablet } = useResponsive();
  
  const shouldUseCards = isMobile;
  const shouldUseHorizontalScroll = isTablet;
  const shouldUseFullTable = !isMobile && !isTablet;
  
  const getTableCellPadding = () => {
    if (isMobile) return '8px';
    if (isTablet) return '12px';
    return '16px';
  };

  const getImageSize = () => {
    if (isMobile) return { width: 60, height: 60 };
    if (isTablet) return { width: 50, height: 50 };
    return { width: 60, height: 60 };
  };

  return {
    shouldUseCards,
    shouldUseHorizontalScroll,
    shouldUseFullTable,
    getTableCellPadding,
    getImageSize,
  };
};

/**
 * Hook for responsive form behavior
 */
export const useResponsiveForm = () => {
  const { isMobile, isTablet } = useResponsive();
  
  const getFormSpacing = () => ({
    xs: 2,
    sm: 3,
    md: 3
  });

  const getFieldSize = () => {
    return isMobile ? 'medium' : 'medium';
  };

  const getGridSpacing = () => ({
    xs: 2,
    sm: 3
  });

  const getImageGridColumns = () => {
    if (isMobile) return 'repeat(auto-fill, minmax(80px, 1fr))';
    if (isTablet) return 'repeat(auto-fill, minmax(100px, 1fr))';
    return 'repeat(auto-fill, minmax(120px, 1fr))';
  };

  return {
    getFormSpacing,
    getFieldSize,
    getGridSpacing,
    getImageGridColumns,
  };
};

export default useResponsive;
