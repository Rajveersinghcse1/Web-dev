import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Visibility, VisibilityOff, Mic } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeToTerms' ? checked : value,
    });
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!formData.agreeToTerms) {
      errors.push('You must agree to the terms and conditions');
    }
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    dispatch(loginStart());
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser = {
        id: '1',
        email: formData.email,
        name: formData.name,
        subscriptionTier: 'free' as const,
        createdAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      dispatch(loginSuccess({ user: mockUser, token: mockToken }));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure('Registration failed. Please try again.'));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(26, 26, 46, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Mic 
                sx={{ 
                  fontSize: 48, 
                  color: 'primary.main',
                  animation: 'pulse 2s ease-in-out infinite',
                }} 
              />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Voice Cloner
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Create your account to get started
            </Typography>
          </Box>

          {(error || formErrors.length > 0) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
              {formErrors.map((err, index) => (
                <div key={index}>{err}</div>
              ))}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link href="#" sx={{ color: 'primary.main' }}>
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="#" sx={{ color: 'primary.main' }}>
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                mb: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #d97706 100%)',
                },
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;