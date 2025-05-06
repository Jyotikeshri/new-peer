// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Container, Box, IconButton, Drawer, List, ListItem, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DynamicLogo from '../common/DynamicLogo';

const navItems = [
  { name: 'Home', path: '/', section: null },
  { name: 'Features', path: '/#features', section: 'features' },
  { name: 'How It Works', path: '/#how-it-works', section: 'how-it-works' },
  { name: 'Testimonials', path: '/#testimonials', section: 'testimonials' },
];

const Navbar = ({ currentUser }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Function to handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close drawer if screen size changes to desktop
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Smooth scroll function
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    
    // Close mobile menu if open
    if (mobileOpen) {
      setMobileOpen(false);
    }
    
    // If we're not on the homepage, navigate to homepage first
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    // If we're already on the homepage, smooth scroll to the section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL without full page reload
      window.history.pushState(null, '', `/#${sectionId}`);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      className={`transition-all duration-300 ${
        scrolled ? "bg-deep-navy shadow-md py-1" : "bg-transparent py-3"
      }`}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters className="justify-between">
          {/* Dynamic Logo */}
          <DynamicLogo currentUser={currentUser} />

          {/* Desktop Navigation */}
          <Box className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              item.section ? (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => scrollToSection(e, item.section)}
                  className="text-white hover:text-teal-accent transition-colors duration-300"
                >
                  {item.name}
                </a>
              ) : (
                <RouterLink
                  key={item.name}
                  to={item.path}
                  className="text-white hover:text-teal-accent transition-colors duration-300"
                >
                  {item.name}
                </RouterLink>
              )
            ))}
          </Box>

          {/* Auth Buttons */}
          <Box className="hidden md:flex space-x-4">
            {currentUser ? (
              <RouterLink to="/dashboard" className="text-white hover:text-teal-accent py-2 px-4 transition-colors duration-300">
                My Dashboard
              </RouterLink>
            ) : (
              <>
                <RouterLink to="/login" className="text-white hover:text-teal-accent py-2 px-4 transition-colors duration-300">
                  Log In
                </RouterLink>
                <RouterLink to="/signup" className="bg-accent-gradient text-white py-2 px-6 rounded-full font-medium hover:shadow-lg transition-all duration-300">
                  Sign Up Free
                </RouterLink>
              </>
            )}
          </Box>

          {/* Mobile menu button - only visible on mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer - only rendered on mobile */}
      {isMobile && (
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { width: '70%', backgroundColor: '#07092F' },
          }}
        >
          <Box className="p-4 text-white">
            <Box className="flex justify-end">
              <IconButton color="inherit" onClick={handleDrawerToggle}>
                <CloseIcon className="text-white" />
              </IconButton>
            </Box>
            <List>
              {navItems.map((item) => (
                <ListItem key={item.name} className="my-4">
                  {item.section ? (
                    <a
                      href={item.path}
                      onClick={(e) => scrollToSection(e, item.section)}
                      className="text-lg hover:text-teal-accent w-full"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <RouterLink
                      to={item.path}
                      className="text-lg hover:text-teal-accent w-full"
                      onClick={handleDrawerToggle}
                    >
                      {item.name}
                    </RouterLink>
                  )}
                </ListItem>
              ))}
              
              {/* Auth Links for mobile */}
              {currentUser ? (
                <ListItem className="my-4">
                  <RouterLink to="/dashboard" className="text-lg hover:text-teal-accent w-full" onClick={handleDrawerToggle}>
                    My Dashboard
                  </RouterLink>
                </ListItem>
              ) : (
                <>
                  <ListItem className="my-4">
                    <RouterLink to="/login" className="text-lg hover:text-teal-accent w-full" onClick={handleDrawerToggle}>
                      Log In
                    </RouterLink>
                  </ListItem>
                  <ListItem className="my-4">
                    <RouterLink
                      to="/signup"
                      className="w-full bg-accent-gradient text-white py-2 px-6 rounded-full text-center"
                      onClick={handleDrawerToggle}
                    >
                      Sign Up Free
                    </RouterLink>
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Drawer>
      )}
    </AppBar>
  );
};

export default Navbar;