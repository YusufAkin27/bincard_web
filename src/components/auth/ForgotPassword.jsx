import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from '@mui/material';
import { Phone } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../../services/auth.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      telephone: '',
    },
    validationSchema: Yup.object({
      telephone: Yup.string()
        .matches(/^[0-9]+$/, 'Sadece rakam giriniz')
        .min(10, 'Telefon numarası en az 10 karakter olmalıdır')
        .required('Telefon numarası gereklidir'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await AuthService.forgotPassword(values.telephone);
        if (response.success) {
          setError('');
          toast.success('Şifre sıfırlama bağlantısı gönderildi!', {
            position: "top-right",
            autoClose: 2000,
            onClose: () => {
              navigate('/reset-password', { 
                state: { 
                  telephone: values.telephone,
                  message: 'Lütfen telefonunuza gönderilen kodu giriniz.'
                }
              });
            }
          });
        }
      } catch (err) {
        console.error('Error:', err);
        const errorMessage = err.response?.data?.message || 'Şifre sıfırlama işlemi başarısız oldu. Lütfen daha sonra tekrar deneyin.';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000
        });
      }
    },
  });

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
              Şifre Sıfırlama
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Şifrenizi sıfırlamak için telefon numaranızı girin.
            Size bir doğrulama kodu göndereceğiz.
          </Typography>

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
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
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
              Doğrulama Kodu Gönder
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="text"
                    sx={{
                      color: '#1976d2',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    Giriş sayfasına dön
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

export default ForgotPassword; 