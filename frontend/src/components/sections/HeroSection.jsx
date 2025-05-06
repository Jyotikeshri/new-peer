// src/components/sections/HeroSection.jsx
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box className="bg-hero-gradient text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Decorative network nodes and lines */}
      <Box className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#14F1D9" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#14F1D9" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="opacity-20">
            {/* Responsive positioning for network visualization */}
            <circle cx={isMobile ? "10%" : "20%"} cy="30%" r={isMobile ? "3" : "5"} fill="#14F1D9" />
            <circle cx={isMobile ? "90%" : "80%"} cy="20%" r={isMobile ? "2" : "3"} fill="#14F1D9" />
            <circle cx="60%" cy={isMobile ? "60%" : "70%"} r={isMobile ? "3" : "4"} fill="#14F1D9" />
            <circle cx="30%" cy={isMobile ? "70%" : "80%"} r={isMobile ? "4" : "6"} fill="#14F1D9" />
            <circle cx="70%" cy="40%" r={isMobile ? "3" : "5"} fill="#14F1D9" />
            <line 
              x1={isMobile ? "10%" : "20%"} 
              y1="30%" 
              x2="60%" 
              y2={isMobile ? "60%" : "70%"} 
              stroke="#14F1D9" 
              strokeWidth={isMobile ? "0.5" : "1"} 
              opacity="0.3" 
            />
            <line 
              x1={isMobile ? "90%" : "80%"} 
              y1="20%" 
              x2="70%" 
              y2="40%" 
              stroke="#14F1D9" 
              strokeWidth={isMobile ? "0.5" : "1"} 
              opacity="0.3" 
            />
            <line 
              x1="70%" 
              y1="40%" 
              x2="60%" 
              y2={isMobile ? "60%" : "70%"} 
              stroke="#14F1D9" 
              strokeWidth={isMobile ? "0.5" : "1"} 
              opacity="0.3" 
            />
            <line 
              x1="30%" 
              y1={isMobile ? "70%" : "80%"} 
              x2="60%" 
              y2={isMobile ? "60%" : "70%"} 
              stroke="#14F1D9" 
              strokeWidth={isMobile ? "0.5" : "1"} 
              opacity="0.3" 
            />
          </g>
        </svg>
      </Box>
      
      <Container maxWidth="lg" className="relative z-10">
        <Box className="text-center max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h1"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6"
            >
              <span className="block mt-2 sm:mt-4">Connect.</span>
              <span className="block text-teal-accent mt-1 sm:mt-2">Learn.</span>
              <span className="block mt-1 sm:mt-2">Achieve.</span>
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography 
              variant="h5" 
              className="mb-6 sm:mb-8 mt-4 sm:mt-6 text-gray-300 text-base sm:text-lg md:text-xl"
            >
              Discover your perfect study partners and accelerate your learning journey.
              <span className="hidden sm:inline"> Join our global community of collaborative learners today.</span>
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 sm:mt-5 mb-4 sm:mb-5"
          >
            <RouterLink
              to="/signup"
              className="bg-accent-gradient text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full font-semibold text-base sm:text-lg inline-block hover:shadow-lg transition-all duration-300"
            >
              Get Started — It's Free
            </RouterLink>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Typography 
              variant="body1" 
              className="mt-4 sm:mt-6 text-gray-300 text-sm sm:text-base"
            >
              Trusted by over 50,000 students from top universities worldwide
            </Typography>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;