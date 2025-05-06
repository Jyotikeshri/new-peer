// src/components/layout/Footer.jsx
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Typography, Box } from '@mui/material';

const Footer = () => {
  return (
    <Box className="bg-deep-navy text-white pt-12 pb-6">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box className="mb-6">
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-teal-accent"></div>
                  <div className="w-2 h-2 rounded-full bg-bright-blue"></div>
                  <div className="w-2 h-2 rounded-full bg-pink-accent"></div>
                </div>
                <Typography variant="h6" className="ml-2 font-bold ml-2">
                  PEER NETWORK
                </Typography>
              </div>
              <Typography variant="body2" className="text-gray-300 mb-4">
                Connect with study partners worldwide and accelerate your learning journey.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" className="font-bold mb-4">
              Platform
            </Typography>
            <Box className="flex flex-col space-y-2">
              <RouterLink to="/features" className="text-gray-300 hover:text-teal-accent">
                Features
              </RouterLink>
              <RouterLink to="/pricing" className="text-gray-300 hover:text-teal-accent">
                Pricing
              </RouterLink>
              <RouterLink to="/how-it-works" className="text-gray-300 hover:text-teal-accent">
                How It Works
              </RouterLink>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" className="font-bold mb-4">
              Company
            </Typography>
            <Box className="flex flex-col space-y-2">
              <RouterLink to="/about" className="text-gray-300 hover:text-teal-accent">
                About Us
              </RouterLink>
              <RouterLink to="/blog" className="text-gray-300 hover:text-teal-accent">
                Blog
              </RouterLink>
              <RouterLink to="/contact" className="text-gray-300 hover:text-teal-accent">
                Contact
              </RouterLink>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" className="font-bold mb-4">
              Resources
            </Typography>
            <Box className="flex flex-col space-y-2">
              <RouterLink to="/community" className="text-gray-300 hover:text-teal-accent">
                Community
              </RouterLink>
              <RouterLink to="/support" className="text-gray-300 hover:text-teal-accent">
                Support
              </RouterLink>
              <RouterLink to="/faq" className="text-gray-300 hover:text-teal-accent">
                FAQ
              </RouterLink>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" className="font-bold mb-4">
              Legal
            </Typography>
            <Box className="flex flex-col space-y-2">
              <RouterLink to="/privacy" className="text-gray-300 hover:text-teal-accent">
                Privacy Policy
              </RouterLink>
              <RouterLink to="/terms" className="text-gray-300 hover:text-teal-accent">
                Terms of Use
              </RouterLink>
            </Box>
          </Grid>
        </Grid>
        
        <Box className="border-t border-gray-800 mt-8 pt-6 text-center">
          <Typography variant="body2" className="text-gray-400">
            © {new Date().getFullYear()} Peer Network. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;