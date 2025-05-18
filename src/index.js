import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pixel Art Inspired Theme
const pixelTheme = createTheme({
  palette: {
    mode: 'light', // The image is light themed
    primary: {
      main: '#302848', // Dark blue/purple from hair/pants for primary actions/text
    },
    secondary: {
      main: '#EAA995', // Skin tone for accents
    },
    background: {
      default: '#7bbbf4', // Light blue from the image's background
      paper: '#7bbbf4',   // A very light, almost white-blue for paper elements
    },
    
    text: {
      primary: '#202038', // Darkest color for main text
      secondary: '#5F8CB0', // Muted blue for secondary text
    },
    // Custom colors from image
    custom: {
      skyBlue: '#82C3F0',
      darkPurpleBlue: 'rgb(32, 32, 56)',
      skinTone: '#F8C9B8',
      shirtWhite: '#E0F0FF', // Slightly off-white
      shadowBlue: '#5F8CB0',
      progressBar: '#FFFFFF',
      
    }
  },
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif', // Or 'Press Start 2P, cursive' for pixel font
    h4: {
      fontWeight: 700,
      color: '#202038', // Darker color for headings
      // textShadow: '1px 1px #E0F0FF', // Optional pixel-style shadow
    },
    h5: {
      fontWeight: 500,
      color: '#202038',
    },
    body1: {
      fontSize: '1.1rem',
      color: '#302848', // Slightly lighter than primary text for body
    },
    body2: {
      color: '#5F8CB0',
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          // To make Paper components slightly pixelated if desired
          // border: '2px solid #202038',
          // boxShadow: '4px 4px 0px #202038', // Pixel-style shadow
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // borderRadius: 0, // Pixel-style buttons
          // border: '2px solid',
          // textTransform: 'none',
          // fontWeight: 'bold',
        }
      }
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={pixelTheme}> {/* Use the new theme */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);