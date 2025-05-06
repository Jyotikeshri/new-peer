// src/components/common/DynamicLogo.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const DynamicLogo = ({ username, currentUser, pageType }) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Determine logo text based on path or props
  const getLogo = () => {
    // If custom page type is provided, use that
    if (pageType) {
      return getLogoByPageType(pageType, username);
    }
    
    // Otherwise detect from path
    if (path === '/') {
      return 'PEER NETWORK';
    } else if (path.startsWith('/profile')) {
      // For current user profile
      if (path === '/profile' && currentUser) {
        return `${currentUser}'s Profile`;
      } 
      // For other user profiles (if username is provided)
      else if (username) {
        return `${username}'s Profile`;
      }
      return 'User Profile';
    } else if (path.startsWith('/features')) {
      return 'Features';
    } else if (path.startsWith('/how-it-works')) {
      return 'How It Works';
    } else if (path.startsWith('/testimonials')) {
      return 'Testimonials';
    } else if (path.startsWith('/login')) {
      return 'Log In';
    } else if (path.startsWith('/signup')) {
      return 'Sign Up';
    } else if (path.startsWith('/dashboard')) {
      return `${currentUser ? `${currentUser}'s ` : ''}Dashboard`;
    } else if (path.startsWith('/study-room')) {
      return 'Study Room';
    } else {
      return 'PEER NETWORK';
    }
  };
  
  // Helper function to get logo for specific page types
  const getLogoByPageType = (type, name) => {
    switch (type) {
      case 'profile':
        return `${name}'s Profile`;
      case 'dashboard':
        return `${name}'s Dashboard`;
      case 'study-room':
        return `Study Room: ${name}`;
      case 'course':
        return `Course: ${name}`;
      default:
        return name || 'PEER NETWORK';
    }
  };

  return (
    <Link to="/" className="flex items-center">
      <Box className="flex items-center">
        <Box className="flex space-x-1">
          <Box className="w-3 h-3 rounded-full bg-teal-accent"></Box>
          <Box className="w-3 h-3 rounded-full bg-bright-blue"></Box>
          <Box className="w-3 h-3 rounded-full bg-pink-accent"></Box>
        </Box>
        <Typography 
          variant="h6" 
          className="ml-2 text-white font-bold text-base sm:text-lg md:text-xl truncate"
          sx={{ maxWidth: { xs: '150px', sm: '200px', md: '300px' } }}
        >
          {getLogo()}
        </Typography>
      </Box>
    </Link>
  );
};

export default DynamicLogo;