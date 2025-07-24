import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage focus and prevent aria-hidden warnings
 * This hook helps prevent the "aria-hidden on focused element" warning
 * by properly managing focus when modals/dialogs open and close
 */
export const useFocusManagement = (isOpen, options = {}) => {
  const {
    restoreFocus = true,
    preventScroll = true,
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  } = options;

  const previousActiveElement = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;

      // Remove focus from any currently focused element to prevent aria-hidden warnings
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }

      // Prevent scrolling on the body when modal is open
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }

      // Focus the container or first focusable element after a short delay
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const firstFocusable = containerRef.current.querySelector(focusableSelector);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            containerRef.current.focus();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Restore scroll
      if (preventScroll) {
        document.body.style.overflow = '';
      }

      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement.current) {
        const timer = setTimeout(() => {
          if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
            try {
              previousActiveElement.current.focus();
            } catch (error) {
              // Ignore focus errors
            }
          }
          previousActiveElement.current = null;
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, restoreFocus, preventScroll, focusableSelector]);

  return containerRef;
};

/**
 * Hook to prevent aria-hidden warnings by managing focus on MUI components
 */
export const useAriaHiddenFix = () => {
  useEffect(() => {
    const handleFocusIn = (event) => {
      const target = event.target;

      // Check if the focused element is inside an aria-hidden container
      let current = target;
      while (current && current !== document.body) {
        if (current.getAttribute('aria-hidden') === 'true') {
          // Found an aria-hidden ancestor, check if it's a MUI component
          const isMuiComponent = current.classList.contains('MuiPopover-root') ||
                                current.classList.contains('MuiMenu-root') ||
                                current.classList.contains('MuiModal-root') ||
                                current.classList.contains('MuiDialog-root');

          if (isMuiComponent) {
            // This is a MUI component that's aria-hidden but has focus
            // Remove focus from the element to prevent the warning
            if (target && typeof target.blur === 'function') {
              target.blur();
            }

            // Find the trigger element and focus it instead
            const triggerId = current.getAttribute('aria-labelledby') ||
                            current.getAttribute('data-trigger-id');
            if (triggerId) {
              const trigger = document.getElementById(triggerId);
              if (trigger && typeof trigger.focus === 'function') {
                setTimeout(() => trigger.focus(), 0);
              }
            }
          }
          break;
        }
        current = current.parentElement;
      }
    };

    const handleMuiMenuClose = (event) => {
      // Handle MUI menu/popover close events
      if (event.type === 'keydown' && event.key === 'Escape') {
        // Find any open MUI menus/popovers and close them properly
        const openMenus = document.querySelectorAll('.MuiMenu-root:not([aria-hidden="true"])');
        const openPopovers = document.querySelectorAll('.MuiPopover-root:not([aria-hidden="true"])');

        [...openMenus, ...openPopovers].forEach(element => {
          // Trigger a click outside to close the menu
          const backdrop = element.querySelector('.MuiBackdrop-root');
          if (backdrop) {
            backdrop.click();
          }
        });
      }
    };

    // Add event listeners with passive option for better performance
    document.addEventListener('focusin', handleFocusIn, { passive: true });
    document.addEventListener('keydown', handleMuiMenuClose, { passive: false });

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleMuiMenuClose);
    };
  }, []);
};

/**
 * Hook to manage focus trap within a container
 */
export const useFocusTrap = (isActive, containerRef) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

/**
 * Hook specifically for MUI Menu/Select components to prevent aria-hidden warnings
 */
export const useMuiMenuFix = (isOpen, anchorEl) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleMenuFocus = () => {
      // Small delay to ensure the menu is rendered
      setTimeout(() => {
        const openMenus = document.querySelectorAll('.MuiMenu-root[aria-hidden="false"]');
        openMenus.forEach(menu => {
          // Remove any focused elements inside aria-hidden containers
          const focusedElements = menu.querySelectorAll(':focus');
          focusedElements.forEach(el => {
            const ariaHiddenParent = el.closest('[aria-hidden="true"]');
            if (ariaHiddenParent) {
              el.blur();
            }
          });
        });
      }, 10);
    };

    // Monitor for focus changes
    document.addEventListener('focusin', handleMenuFocus, { passive: true });

    return () => {
      document.removeEventListener('focusin', handleMenuFocus);
    };
  }, [isOpen]);
};

/**
 * Hook to fix aria-hidden warnings for Select components
 */
export const useSelectFix = () => {
  useEffect(() => {
    const handleSelectOpen = (event) => {
      // Check if this is a MUI Select opening
      if (event.target.closest('.MuiSelect-root')) {
        setTimeout(() => {
          // Find any aria-hidden menus with focused elements
          const ariaHiddenMenus = document.querySelectorAll('.MuiMenu-root[aria-hidden="true"]');
          ariaHiddenMenus.forEach(menu => {
            const focusedElements = menu.querySelectorAll(':focus');
            focusedElements.forEach(el => el.blur());
          });
        }, 0);
      }
    };

    document.addEventListener('click', handleSelectOpen, { passive: true });

    return () => {
      document.removeEventListener('click', handleSelectOpen);
    };
  }, []);
};

export default {
  useFocusManagement,
  useAriaHiddenFix,
  useFocusTrap,
  useMuiMenuFix,
  useSelectFix
};
