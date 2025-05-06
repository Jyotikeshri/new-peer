// src/components/sections/CtaSection.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CtaSection = () => {
  return (
    <Box className="py-16 md:py-20 lg:py-24 bg-hero-gradient text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <Box className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#14F1D9" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#14F1D9" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="opacity-20">
            <circle cx="10%" cy="20%" r="5" fill="#14F1D9" />
            <circle cx="85%" cy="15%" r="4" fill="#14F1D9" />
            <circle cx="75%" cy="80%" r="6" fill="#14F1D9" />
            <circle cx="20%" cy="85%" r="4" fill="#14F1D9" />
            <line x1="10%" y1="20%" x2="75%" y2="80%" stroke="#14F1D9" strokeWidth="1" opacity="0.3" />
            <line x1="85%" y1="15%" x2="75%" y2="80%" stroke="#14F1D9" strokeWidth="1" opacity="0.3" />
            <line x1="20%" y1="85%" x2="75%" y2="80%" stroke="#14F1D9" strokeWidth="1" opacity="0.3" />
          </g>
        </svg>
      </Box>

      <Container maxWidth="lg" className="relative z-10">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Typography variant="h2" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
                Ready to Transform Your Learning Experience?
              </Typography>
              
              <Typography variant="body1" className="text-gray-300 mt-4 text-base sm:text-lg mb-6 md:mb-0 max-w-xl">
                Join thousands of students worldwide who are already using Peer Network to connect, collaborate, and achieve their academic goals.
              </Typography>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-center md:justify-end gap-4"
            >
              <RouterLink 
                to="/signup" 
                className="bg-white text-deep-navy py-3 px-8 rounded-full font-semibold text-lg w-full sm:w-auto text-center inline-flex items-center justify-center hover:shadow-lg transition-all duration-300"
              >
                Sign Up For Free
                <ArrowForwardIcon className="ml-2" />
              </RouterLink>
              
             
                <a
                 
                  href='/#how-it-works'
                  onClick={(e) => scrollToSection(e, item.section)}
                  className="bg-transparent border-2 border-white text-white py-3 px-8 rounded-full font-semibold text-lg w-full sm:w-auto text-center inline-flex items-center justify-center hover:bg-white hover:text-deep-navy transition-all duration-300"
                >
                 Learn More
                </a>
                
           
            </motion.div>
          </Grid>
        </Grid>
        
        <Box className="mt-16 pt-12 border-t border-white border-opacity-20">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="text-center">
                <Typography variant="h3" className="text-4xl font-bold mb-2 text-teal-accent">50K+</Typography>
                <Typography variant="body1" className="text-gray-300">Active Students</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box className="text-center">
                <Typography variant="h3" className="text-4xl font-bold mb-2 text-teal-accent">120+</Typography>
                <Typography variant="body1" className="text-gray-300">Universities</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box className="text-center">
                <Typography variant="h3" className="text-4xl font-bold mb-2 text-teal-accent">95%</Typography>
                <Typography variant="body1" className="text-gray-300">Success Rate</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box className="text-center">
                <Typography variant="h3" className="text-4xl font-bold mb-2 text-teal-accent">24/7</Typography>
                <Typography variant="body1" className="text-gray-300">Support</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default CtaSection;