import { useEffect } from 'react';

export const useSearchFocus = () => {
  useEffect(() => {
    // Focus the search input if the URL has a 'focus=search' parameter
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('focus') === 'search') {
      // Small delay to ensure the input is mounted
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
          // Remove the focus parameter from URL
          searchParams.delete('focus');
          const newUrl = window.location.pathname + 
            (searchParams.toString() ? `?${searchParams.toString()}` : '');
          window.history.replaceState({}, '', newUrl);
        }
      }, 100);
    }
  }, []);
}; 