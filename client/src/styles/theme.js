import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#2c2c2c',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
      light: '#ffffff',
      dark: '#cccccc',
      contrastText: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#2c2c2c',
    },
  },
  breakpoints: {
    values: {
      xs: 0,        // Mobile: ≤640px
      sm: 641,      // Tablet: 641px–1024px
      md: 1025,     // Small Desktop: 1025px–1280px
      lg: 1281,     // Large Desktop: 1281px+
      xl: 1920,     // Extra Large Desktop
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.9375rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.8125rem',
      },
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '0 16px',
          },
          '@media (min-width:601px) and (max-width:960px)': {
            padding: '0 24px',
          },
          '@media (min-width:961px)': {
            padding: '0 32px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          '@media (max-width:600px)': {
            padding: '6px 12px',
            fontSize: '0.875rem',
          },
          '@media (min-width:601px) and (max-width:960px)': {
            padding: '8px 16px',
            fontSize: '0.9375rem',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          padding: '12px 24px',
          '@media (max-width:600px)': {
            padding: '10px 20px',
          },
        },
        sizeSmall: {
          padding: '4px 8px',
          '@media (max-width:600px)': {
            padding: '4px 8px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: 8,
          '@media (max-width:600px)': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#000000',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            '@media (max-width:600px)': {
              fontSize: '0.875rem',
            },
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        disableRestoreFocus: true,
        disableEnforceFocus: false,
        disableAutoFocus: false,
      },
      styleOverrides: {
        paper: {
          '@media (max-width:600px)': {
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)',
          },
        },
      },
    },
    MuiModal: {
      defaultProps: {
        disableRestoreFocus: true,
        disableEnforceFocus: false,
        disableAutoFocus: false,
      },
    },
    MuiDrawer: {
      defaultProps: {
        disableRestoreFocus: true,
        disableEnforceFocus: false,
        disableAutoFocus: false,
      },
      styleOverrides: {
        paper: {
          '@media (max-width:600px)': {
            width: '100%',
          },
          '@media (min-width:601px)': {
            width: '400px',
          },
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        disableRestoreFocus: false,
        disableEnforceFocus: false,
        disableAutoFocus: true,
        keepMounted: false,
      },
      styleOverrides: {
        root: {
          '&[aria-hidden="true"]': {
            // Ensure proper focus management when aria-hidden is applied
            '& *:focus': {
              outline: 'none',
              visibility: 'hidden',
            },
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        disableRestoreFocus: false,
        disableEnforceFocus: false,
        disableAutoFocus: true,
        keepMounted: false,
        // Add proper ARIA attributes
        MenuListProps: {
          'aria-labelledby': undefined,
          role: 'menu',
        },
      },
      styleOverrides: {
        root: {
          '&[aria-hidden="true"]': {
            // Ensure proper focus management when aria-hidden is applied
            '& *:focus': {
              outline: 'none',
              visibility: 'hidden',
            },
          },
        },
        list: {
          // Ensure menu items are properly focusable
          '& .MuiMenuItem-root': {
            '&:focus': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px',
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disableRestoreFocus: false,
          disableEnforceFocus: false,
          disableAutoFocus: true,
          keepMounted: false,
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px',
            fontSize: '0.875rem',
          },
        },
      },
    },
  },
});

// Make typography responsive
export const theme = responsiveFontSizes(baseTheme); 