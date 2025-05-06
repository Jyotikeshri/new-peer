// src/pages/SignupPage.jsx
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Divider,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Person, 
  School, 
  LockOutlined,
} from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import useAuthStore from '../contexts/authStore';

// Example university options
const universities = [
  "Harvard University",
  "Stanford University",
  "MIT",
  "Oxford University",
  "Princeton University",
  "Cambridge University",
  "Yale University",
  "Columbia University",
  "University of Chicago",
  "Imperial College London",
  "Other"
];

// Example subject options
const subjects = [
  "Computer Science",
  "Business & Economics",
  "Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Medicine",
  "Arts & Humanities",
  "Social Sciences",
  "Law",
  "Other"
];

const SignupPage = () => {
  const navigate = useNavigate();
  
  // Use Zustand auth store
  const { register, isLoading, error: authError, isAuthenticated } = useAuthStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    university: '',
    subject: '',
    yearOfStudy: '',
    agreeToTerms: false,
    receiveUpdates: true
  });

  // Form validation states
  const [validation, setValidation] = useState({
    firstName: true,
    lastName: true,
    email: true,
    password: true,
    university: true,
    subject: true,
    yearOfStudy: true,
    agreeToTerms: true
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
  
  const validateStep = (step) => {
    if (step === 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
      
      const newValidation = {
        firstName: !!formData.firstName.trim(),
        lastName: !!formData.lastName.trim(),
        email: emailRegex.test(formData.email),
        password: passwordRegex.test(formData.password),
      };
      
      setValidation(prev => ({ ...prev, ...newValidation }));
      return Object.values(newValidation).every(valid => valid);
    }
    
    if (step === 1) {
      const newValidation = {
        university: !!formData.university,
        subject: !!formData.subject,
        yearOfStudy: !!formData.yearOfStudy,
      };
      
      setValidation(prev => ({ ...prev, ...newValidation }));
      return Object.values(newValidation).every(valid => valid);
    }
    
    if (step === 2) {
      const termsValid = formData.agreeToTerms;
      setValidation(prev => ({ ...prev, agreeToTerms: termsValid }));
      return termsValid;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast({ ...toast, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setError('');
    
    try {
      // Prepare the data to be sent to the API
      const userData = {
        username: `${formData.firstName} ${formData.lastName}`, // Combine first and last name for username
        email: formData.email,
        password: formData.password,
        // Add optional academic info to bio
        bio: `${formData.university} - ${formData.subject}, ${formData.yearOfStudy} Year`,
        // Initialize other required fields with empty values
        interests: [],
        strengths: [],
        needsHelpWith: []
      };
      
      // Use Zustand auth store for registration
      const success = await register(userData);
      
      if (success) {
        // Show success toast notification
        setToast({
          open: true,
          message: 'Registration successful! Welcome to Peer Network',
          severity: 'success'
        });
        
        // Navigate to dashboard - the useEffect will handle this
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error(err);
    }
  };

  const handleGoogleSignup = () => {
    // Implement Google OAuth signup
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    console.log('Google signup clicked');
  };

  // Define the steps
  const steps = ['Account Details', 'Academic Information', 'Finish Setup'];

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Render different step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div 
            key="step1" 
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={!validation.firstName}
                  helperText={!validation.firstName && 'First name is required'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className="text-text-gray" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={!validation.lastName}
                  helperText={!validation.lastName && 'Last name is required'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person className="text-text-gray" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
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
                  helperText={!validation.password && 'Password must be at least 8 characters and include both letters and numbers'}
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
            </Grid>
          </motion.div>
        );
      
      case 1:
        return (
          <motion.div 
            key="step2" 
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box className="flex flex-col">
                  <Box className="relative border border-gray-200 rounded-lg px-4 py-3 mb-4">
                    <Box className="absolute -top-3 bg-white px-2 ml-2">
                      <Typography variant="body2" className="text-text-gray">
                        University/Institution
                      </Typography>
                    </Box>
                    <Box className="flex items-center">
                      <School className="text-text-gray mr-3" />
                      <select
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        className={`w-full bg-transparent outline-none ${!validation.university ? 'text-red-500' : formData.university ? 'text-deep-navy' : 'text-gray-400'}`}
                      >
                        <option value="" disabled>Select your university</option>
                        {universities.map((university) => (
                          <option key={university} value={university}>
                            {university}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </Box>
                  {!validation.university && (
                    <Typography variant="caption" className="text-red-500 -mt-3 ml-2">
                      Please select your university
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box className="flex flex-col">
                  <Box className="relative border border-gray-200 rounded-lg px-4 py-3 mb-4">
                    <Box className="absolute -top-3 bg-white px-2 ml-2">
                      <Typography variant="body2" className="text-text-gray">
                        Field of Study
                      </Typography>
                    </Box>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full bg-transparent outline-none ${!validation.subject ? 'text-red-500' : formData.subject ? 'text-deep-navy' : 'text-gray-400'}`}
                    >
                      <option value="" disabled>Select field</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </Box>
                  {!validation.subject && (
                    <Typography variant="caption" className="text-red-500 -mt-3 ml-2">
                      Please select your field of study
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box className="flex flex-col">
                  <Box className="relative border border-gray-200 rounded-lg px-4 py-3 mb-4">
                    <Box className="absolute -top-3 bg-white px-2 ml-2">
                      <Typography variant="body2" className="text-text-gray">
                        Year
                      </Typography>
                    </Box>
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      className={`w-full bg-transparent outline-none ${!validation.yearOfStudy ? 'text-red-500' : formData.yearOfStudy ? 'text-deep-navy' : 'text-gray-400'}`}
                    >
                      <option value="" disabled>Select year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                      <option value="5+">5+ Year</option>
                      <option value="Masters">Masters</option>
                      <option value="PhD">PhD</option>
                      <option value="Postdoc">Postdoc</option>
                    </select>
                  </Box>
                  {!validation.yearOfStudy && (
                    <Typography variant="caption" className="text-red-500 -mt-3 ml-2">
                      Please select your year of study
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div 
            key="step3" 
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <Box className="text-center mb-8">
              <Box className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-accent bg-opacity-10 mb-4">
                <Box className="w-10 h-10 rounded-full bg-teal-accent flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Box>
              </Box>
              
              <Typography variant="h5" className="font-bold mb-2">Almost There!</Typography>
              <Typography variant="body1" className="text-text-gray">
                Review your information and complete your registration
              </Typography>
            </Box>
            
            <Grid container spacing={3} className="mb-6">
              <Grid item xs={12} sm={6}>
                <Box className="mb-4">
                  <Typography variant="body2" className="text-text-gray mb-1">
                    Name
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box className="mb-4">
                  <Typography variant="body2" className="text-text-gray mb-1">
                    Email
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formData.email}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box className="mb-4">
                  <Typography variant="body2" className="text-text-gray mb-1">
                    University
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formData.university}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box className="mb-4">
                  <Typography variant="body2" className="text-text-gray mb-1">
                    Field of Study
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {formData.subject}, {formData.yearOfStudy} Year
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box className="mb-6">
              <Box className="flex items-start mb-2">
                <Checkbox
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  color="primary"
                  className={!validation.agreeToTerms ? "text-red-500" : ""}
                  sx={{ padding: '4px' }}
                />
                <Box className="ml-1">
                  <Typography variant="body2">
                    I agree to the{" "}
                    <RouterLink to="/terms" className="text-bright-blue hover:underline" target="_blank">
                      Terms of Service
                    </RouterLink>
                    {" "}and{" "}
                    <RouterLink to="/privacy" className="text-bright-blue hover:underline" target="_blank">
                      Privacy Policy
                    </RouterLink>
                  </Typography>
                  {!validation.agreeToTerms && (
                    <Typography variant="caption" className="text-red-500">
                      You must agree to the Terms of Service and Privacy Policy
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Box className="flex items-start">
                <Checkbox
                  name="receiveUpdates"
                  checked={formData.receiveUpdates}
                  onChange={handleChange}
                  color="primary"
                  sx={{ padding: '4px' }}
                />
                <Box className="ml-1">
                  <Typography variant="body2">
                    Send me learning tips and platform updates (optional)
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box 
      className="min-h-screen rounded-lg py-12 md:py-20"
      sx={{
        background: 'linear-gradient(45deg, #07092F 0%, #122C86 100%)',
        marginTop: '40px',
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} className="p-6 md:p-8 rounded-xl" sx={{ backgroundColor: '#f5f5f5' }}>
          <Box className="text-center mb-6">
            <Typography variant="h4" className="font-bold text-deep-navy mb-2">
              Create Your Account
            </Typography>
            <Typography variant="body1" className="text-text-gray">
              Join thousands of students already using Peer Network
            </Typography>
          </Box>
          
          {error && (
            <Box className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </Box>
          )}
          
          <Stepper activeStep={activeStep} className="mb-6">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
            {renderStepContent(activeStep)}
            
            <Box className="mt-8 flex flex-col sm:flex-row justify-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className="mb-3 sm:mb-0 px-6"
                variant="outlined"
              >
                Back
              </Button>
              
              <Button
                type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                variant="contained"
                onClick={activeStep === steps.length - 1 ? undefined : handleNext}
                className="bg-accent-gradient text-white py-2 px-6 rounded-full hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 
                  activeStep === steps.length - 1 ? 'Complete Sign Up' : 'Continue'}
              </Button>
            </Box>
          </form>
          
          {activeStep === 0 && (
            <>
              <Divider className="my-6">OR</Divider>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignup}
                className="py-3 rounded-full mb-6"
              >
                Continue with Google
              </Button>
              
              <Typography className="text-center text-text-gray">
                Already have an account?{' '}
                <RouterLink to="/login" className="text-bright-blue hover:underline">
                  Log in
                </RouterLink>
              </Typography>
            </>
          )}
        </Paper>
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

export default SignupPage;