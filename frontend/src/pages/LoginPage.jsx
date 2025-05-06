// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  LockOutlined,
} from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import useAuthStore from '../contexts/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use Zustand auth store
  const { login, isLoading, error: authError, isAuthenticated } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Form validation states
  const [validation, setValidation] = useState({
    email: true,
    password: true
  });

  // Check if already authenticated on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Navigate to the intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Set error from auth store
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear validation errors as user types
    if (!validation[name]) {
      setValidation(prev => ({ ...prev, [name]: true }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast({ ...toast, open: false });
  };
  
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const newValidation = {
      email: emailRegex.test(formData.email),
      password: !!formData.password.trim(),
    };
    
    setValidation(newValidation);
    return Object.values(newValidation).every(valid => valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');

    try {
      // Use Zustand auth store for login
      const success = await login(formData.email, formData.password);
      
      if (success) {
        setToast({
          open: true,
          message: 'Login successful!',
          severity: 'success'
        });
        // The useEffect will handle navigation
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
      console.error(err);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth login
    console.log('Google login clicked');
  };

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <Box 
      className="min-h-screen rounded-lg py-12 md:py-20"
      sx={{
        background: 'linear-gradient(45deg, #07092F 0%, #122C86 100%)',
        marginTop: '40px',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          exit={fadeIn.exit}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={3} className="p-6 md:p-8 rounded-xl" sx={{ backgroundColor: '#f5f5f5' }}>
            <Box className="text-center mb-6">
              <Typography variant="h4" className="font-bold text-deep-navy mb-2">
                Welcome Back
              </Typography>
              <Typography variant="body1" className="text-text-gray">
                Log in to your Peer Network account
              </Typography>
            </Box>
            
            {error && (
              <Box className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
              </Box>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!validation.email}
                    helperText={!validation.email && 'Please enter a valid email address'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email className="text-text-gray" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={!validation.password}
                    helperText={!validation.password && 'Password is required'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined className="text-text-gray" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center">
                      <Checkbox
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        color="primary"
                        sx={{ padding: '4px' }}
                      />
                      <Typography variant="body2">
                        Remember me
                      </Typography>
                    </Box>
                    
                    <RouterLink to="/forgot-password" className="text-bright-blue hover:underline">
                      <Typography variant="body2">
                        Forgot password?
                      </Typography>
                    </RouterLink>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className="bg-accent-gradient text-white py-3 px-6 rounded-full hover:shadow-lg"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            
            <Divider className="my-6">OR</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              className="py-3 rounded-full mb-6"
            >
              Continue with Google
            </Button>
            
            <Typography className="text-center text-text-gray">
              Don't have an account?{' '}
              <RouterLink to="/signup" className="text-bright-blue hover:underline">
                Sign up
              </RouterLink>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
      
      {/* Toast notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;