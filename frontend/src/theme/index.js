// src/theme/index.js
import { createTheme } from '@mui/material/styles';

// Theme that will work alongside Tailwind
const theme = createTheme({
  palette: {
    primary: {
      main: '#122C86', // Royal Blue
      dark: '#07092F',  // Deep Navy Blue
      light: '#3672F8', // Bright Blue
    },
    secondary: {
      main: '#14F1D9', // Teal Accent
    },
    text: {
      primary: '#07092F',
      secondary: '#5A6282',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    // Additional colors for stats cards and charts
    blue: {
      main: '#3B82F6',
      light: '#60A5FA'
    },
    indigo: {
      main: '#4338CA',
      light: '#6366F1'
    },
    purple: {
      main: '#9333EA',
      light: '#A855F7'
    },
    pink: {
      main: '#EC4899',
      light: '#F472B6'
    },
    teal: {
      main: '#00897B',
      light: '#009688',
      dark: '#00796B'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // Rounded full like Tailwind
          padding: '10px 24px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0A0C40', // Dark blue background
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;