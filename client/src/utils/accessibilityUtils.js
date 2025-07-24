/**
 * Accessibility utilities for fixing MUI component focus issues
 * This module provides utilities to prevent aria-hidden warnings and improve accessibility
 */

/**
 * Global event listener to handle aria-hidden focus issues
 */
let isInitialized = false;

export const initializeAccessibilityFixes = () => {
  if (isInitialized || typeof window === 'undefined') return;

  // Handle focus events to prevent aria-hidden warnings
  const handleGlobalFocus = (event) => {
    const target = event.target;
    if (!target) return;

    // Check if the focused element is inside an aria-hidden container
    let current = target;
    while (current && current !== document.body) {
      if (current.getAttribute('aria-hidden') === 'true') {
        // Check if this is a MUI component
        const isMuiComponent = current.classList.contains('MuiPopover-root') ||
                              current.classList.contains('MuiMenu-root') ||
                              current.classList.contains('MuiModal-root') ||
                              current.classList.contains('MuiDialog-root') ||
                              current.classList.contains('MuiSelect-root');

        if (isMuiComponent) {
          // Remove focus to prevent aria-hidden warning
          if (target && typeof target.blur === 'function') {
            target.blur();
          }
          
          // Try to find and focus the trigger element
          const menuButton = document.querySelector('[aria-expanded="true"][aria-haspopup]');
          if (menuButton && typeof menuButton.focus === 'function') {
            setTimeout(() => menuButton.focus(), 0);
          }
        }
        break;
      }
      current = current.parentElement;
    }
  };

  // Handle MUI Menu/Popover close on escape
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      // Find and close any open MUI menus/popovers
      const openMenus = document.querySelectorAll('.MuiMenu-root:not([aria-hidden="true"])');
      const openPopovers = document.querySelectorAll('.MuiPopover-root:not([aria-hidden="true"])');
      
      [...openMenus, ...openPopovers].forEach(element => {
        const backdrop = element.querySelector('.MuiBackdrop-root');
        if (backdrop) {
          backdrop.click();
        }
      });
    }
  };

  // Handle MUI Select focus issues
  const handleSelectFocus = () => {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const ariaHiddenMenus = document.querySelectorAll('.MuiMenu-root[aria-hidden="true"]');
      ariaHiddenMenus.forEach(menu => {
        const focusedElements = menu.querySelectorAll(':focus');
        focusedElements.forEach(el => {
          if (el && typeof el.blur === 'function') {
            el.blur();
          }
        });
      });
    }, 10);
  };

  // Add event listeners
  document.addEventListener('focusin', handleGlobalFocus, { passive: true });
  document.addEventListener('keydown', handleEscapeKey, { passive: false });
  document.addEventListener('click', handleSelectFocus, { passive: true });

  // Mark as initialized
  isInitialized = true;

  // Return cleanup function
  return () => {
    document.removeEventListener('focusin', handleGlobalFocus);
    document.removeEventListener('keydown', handleEscapeKey);
    document.removeEventListener('click', handleSelectFocus);
    isInitialized = false;
  };
};

/**
 * Fix aria-hidden issues for a specific MUI component
 */
export const fixMuiComponentAccessibility = (componentRef) => {
  if (!componentRef?.current) return;

  const component = componentRef.current;
  
  // Remove focus from any focused elements inside aria-hidden containers
  const focusedElements = component.querySelectorAll(':focus');
  focusedElements.forEach(el => {
    const ariaHiddenParent = el.closest('[aria-hidden="true"]');
    if (ariaHiddenParent) {
      el.blur();
    }
  });
};

/**
 * Enhanced MenuProps for MUI Select components to prevent aria-hidden warnings
 */
export const getAccessibleMenuProps = (customProps = {}) => ({
  disableRestoreFocus: false,
  disableEnforceFocus: false,
  disableAutoFocus: true,
  keepMounted: false,
  PaperProps: {
    style: {
      maxHeight: 300,
    },
  },
  ...customProps,
});

/**
 * Enhanced props for MUI Menu components
 */
export const getAccessibleMenuComponentProps = (id, labelledBy) => ({
  id,
  MenuListProps: {
    'aria-labelledby': labelledBy,
    role: 'menu',
  },
  transformOrigin: { horizontal: 'right', vertical: 'top' },
  anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
  disableRestoreFocus: false,
  disableEnforceFocus: false,
  disableAutoFocus: true,
});

/**
 * Enhanced props for MUI Dialog components
 */
export const getAccessibleDialogProps = () => ({
  disableRestoreFocus: false,
  disableEnforceFocus: false,
  disableAutoFocus: false,
});

/**
 * Enhanced props for MUI Modal components
 */
export const getAccessibleModalProps = () => ({
  disableRestoreFocus: false,
  disableEnforceFocus: false,
  disableAutoFocus: false,
});

/**
 * Create accessible Select component props
 */
export const createAccessibleSelectProps = (labelId, selectId, customMenuProps = {}) => ({
  labelId,
  id: selectId,
  MenuProps: getAccessibleMenuProps(customMenuProps),
});

/**
 * Utility to ensure proper focus management for form controls
 */
export const ensureFormControlAccessibility = (formRef) => {
  if (!formRef?.current) return;

  const form = formRef.current;
  
  // Ensure all Select components have proper IDs and labels
  const selects = form.querySelectorAll('.MuiSelect-root');
  selects.forEach((select, index) => {
    const selectInput = select.querySelector('input');
    const label = select.closest('.MuiFormControl-root')?.querySelector('.MuiInputLabel-root');
    
    if (selectInput && label) {
      const labelId = `select-label-${index}`;
      const selectId = `select-${index}`;
      
      if (!label.id) label.id = labelId;
      if (!selectInput.id) selectInput.id = selectId;
      if (!selectInput.getAttribute('aria-labelledby')) {
        selectInput.setAttribute('aria-labelledby', labelId);
      }
    }
  });
};

export default {
  initializeAccessibilityFixes,
  fixMuiComponentAccessibility,
  getAccessibleMenuProps,
  getAccessibleMenuComponentProps,
  getAccessibleDialogProps,
  getAccessibleModalProps,
  createAccessibleSelectProps,
  ensureFormControlAccessibility,
};
