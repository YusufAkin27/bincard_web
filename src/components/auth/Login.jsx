import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Phone, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../../services/auth.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, {
        position: "top-center",
        autoClose: 5000
      });
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const formik = useFormik({
    initialValues: {
      telephone: '',
      password: '',
    },
    validationSchema: Yup.object({
      telephone: Yup.string()
        .matches(/^[0-9]+$/, 'Sadece rakam giriniz')
        .min(10, 'Telefon numarası en az 10 karakter olmalıdır')
        .max(11, 'Telefon numarası en fazla 11 karakter olmalıdır')
        .test('is-valid', 'Geçerli bir telefon numarası giriniz', (value) => {
          if (!value) return false;
          // 0 ile başlayan 11 haneli telefon numarası
          return /^0[0-9]{10}$/.test(value);
        })
        .required('Telefon numarası gereklidir'),
      password: Yup.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Şifre gereklidir'),
    }),
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError('');

      try {
        // Telefon numarasının formatını kontrol et
        let telephone = values.telephone;
        if (!telephone.startsWith('0')) {
          telephone = '0' + telephone;
        }

        console.log('Giriş denemesi:', { telephone });
        const response = await AuthService.login(telephone, values.password);
        
        if (response && response.success) {
          toast.success('Giriş başarılı! Yönlendiriliyorsunuz...', {
            position: "top-center",
            autoClose: 2000,
            onClose: () => {
              navigate('/dashboard');
            }
          });
        } else {
          throw new Error(response?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        }
      } catch (err) {
        console.error('Giriş Hatası Detayları:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });

        let errorMessage;
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 500) {
          errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Telefon numarası veya şifre hatalı.';
        } else if (err.message) {
          errorMessage = err.message;
        } else {
          errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
        }

        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 5000
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
        padding: { xs: 2, sm: 4 }
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
        <Paper
          elevation={10}
          sx={{
            width: '100%',
            padding: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1976d2',
                mb: 1
              }}
            >
              BinCard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Akıllı Bilet Sistemine Hoş Geldiniz
            </Typography>
          </Box>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              id="telephone"
              name="telephone"
              label="Telefon Numarası"
              value={formik.values.telephone}
              onChange={formik.handleChange}
              error={formik.touched.telephone && Boolean(formik.errors.telephone)}
              helperText={formik.touched.telephone && formik.errors.telephone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              margin="normal"
              id="password"
              name="password"
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mb: 3,
                height: 48,
                background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #42a5f5 90%)',
                }
              }}
            >
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    Hesap Oluştur
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="text"
                    sx={{
                      color: '#1976d2',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    Şifremi Unuttum
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
      <ToastContainer />
    </Box>
  );
};

export default Login; 