// src/components/errors/ErrorBoundary.jsx
import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const ErrorBoundary = () => {
  const error = useRouteError();
  
  // Determine if it's a 404 or another error
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const errorMessage = is404 
    ? "We couldn't find the page you're looking for" 
    : "Something went wrong on our end";
  
  const errorTitle = is404 ? "Page Not Found" : "Unexpected Application Error";
  const errorIcon = is404 ? <SentimentDissatisfiedIcon sx={{ fontSize: 80 }} /> : <BugReportIcon sx={{ fontSize: 80 }} />;

  const handleRefresh = () => {
    window.location.reload();
  };

  // If we have dev details and not in production
  const showDevDetails = process.env.NODE_ENV !== 'production' && !is404;

  return (
    <Box className="min-h-screen bg-hero-gradient text-white flex items-center justify-center py-16">
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box className="text-teal-accent mb-6">
                {errorIcon}
              </Box>
              
              <Typography variant="h2" className="font-bold mb-2 text-white text-4xl md:text-5xl">
                {errorTitle}
              </Typography>
              
              <Typography variant="h5" className="text-gray-300 mb-8">
                {errorMessage}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
            >
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                component={Link}
                to="/"
                className="bg-accent-gradient text-white py-3 px-6 rounded-full font-medium hover:shadow-lg transition-all duration-300"
              >
                Back to Home
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                className="border-2 border-white text-white py-3 px-6 rounded-full font-medium hover:bg-white hover:text-deep-navy transition-all duration-300"
              >
                Refresh Page
              </Button>
            </motion.div>
          </Grid>
          
          {/* Developer information section */}
          {showDevDetails && (
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Box className="bg-deep-navy bg-opacity-50 p-6 rounded-xl border border-teal-accent border-opacity-30">
                  <Typography variant="h6" className="font-semibold mb-4 text-teal-accent">
                    Developer Information
                  </Typography>
                  
                  <Typography variant="body2" className="font-mono text-gray-300 mb-4 overflow-auto whitespace-pre-wrap bg-black bg-opacity-30 p-4 rounded-lg">
                    {error?.message || "Unknown error occurred"}
                    {error?.stack && (
                      <Box component="pre" className="mt-4 text-xs text-gray-400 max-h-60 overflow-auto">
                        {error.stack}
                      </Box>
                    )}
                  </Typography>
                  
                  <Typography variant="body2" className="text-gray-400 italic">
                    This information is only visible in development mode.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          )}

          {/* Lost user suggestions */}
          {is404 && (
            <Grid item xs={12} md={8} className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Box className="bg-deep-navy bg-opacity-50 p-6 rounded-xl border border-teal-accent border-opacity-30">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Looking for something?
                  </Typography>
                  
                  <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <Link to="/features" className="text-teal-accent hover:underline py-2">
                      → Explore Features
                    </Link>
                    <Link to="/how-it-works" className="text-teal-accent hover:underline py-2">
                      → How It Works
                    </Link>
                    <Link to="/testimonials" className="text-teal-accent hover:underline py-2">
                      → Success Stories
                    </Link>
                    <Link to="/signup" className="text-teal-accent hover:underline py-2">
                      → Create an Account
                    </Link>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;