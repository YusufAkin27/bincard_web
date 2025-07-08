import React, { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  Badge,
  Sms
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../../services/auth.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const steps = ['Kişisel Bilgiler', 'SMS Doğrulama'];

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const formatPhoneNumber = (phone) => {
    // Sadece rakamları al
    let value = phone.replace(/[^0-9]/g, '');
    
    // Eğer ilk rakam 0 değilse, başına 0 ekle
    if (value.length > 0 && !value.startsWith('0')) {
      value = '0' + value;
    }
    
    return value;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Sadece rakamları al
    
    // Eğer ilk rakam 0 değilse, başına 0 ekle
    if (value.length > 0 && !value.startsWith('0')) {
      value = '0' + value;
    }
    
    // Maksimum 11 karakter
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    formik.setFieldValue('telephone', value);
  };

  // Bağlantı testi
  const testBackendConnection = async () => {
    try {
      setIsTestingConnection(true);
      const isConnected = await AuthService.testConnection();
      if (!isConnected) {
        setError('Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
        toast.error('Sunucu bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.', {
          position: "top-center",
          autoClose: 5000
        });
      }
      return isConnected;
    } catch (error) {
      console.error('Backend bağlantı testi başarısız:', error);
      setError('Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
      toast.error('Sunucu bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.', {
        position: "top-center",
        autoClose: 5000
      });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Component yüklendiğinde bağlantıyı test et
  useEffect(() => {
    testBackendConnection();
  }, []);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      telephone: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required('Ad gereklidir')
        .min(2, 'Ad en az 2 karakter olmalıdır'),
      lastName: Yup.string()
        .required('Soyad gereklidir')
        .min(2, 'Soyad en az 2 karakter olmalıdır'),
      telephone: Yup.string()
        .matches(/^0[0-9]{10}$/, 'Telefon numarası 0 ile başlamalı ve 11 haneli olmalıdır (Örn: 05366543708)')
        .required('Telefon numarası gereklidir'),
      password: Yup.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Şifre gereklidir'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
        .required('Şifre tekrarı gereklidir'),
    }),
    onSubmit: async (values) => {
      if (isSubmitting || isTestingConnection) return;
      
      try {
        // Form verilerini hazırla
        const formData = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          telephone: values.telephone.trim(),
          password: values.password,
          deviceUuid: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef', // örnek uuid, gerçek uuid ile değiştirilebilir
          fcmToken: 'fcm_örnek_token_bilgisi' // örnek token, gerçek fcm token ile değiştirilebilir
        };

        // Form verilerini kontrol et
        if (!formData.telephone) {
          throw new Error('Telefon numarası boş olamaz');
        }

        if (!formData.telephone.match(/^0[0-9]{10}$/)) {
          throw new Error('Telefon numarası 0 ile başlamalı ve 11 haneli olmalıdır (Örn: 05366543708)');
        }

        console.log('Gönderilecek form verileri:', {
          ...formData,
          telephone: formData.telephone, // Telefon numarasını göster
          password: '[GİZLİ]'
        });

        setIsSubmitting(true);
        setError('');

        if (activeStep === 0) {
          const response = await AuthService.register(formData);
          
          if (response && response.success) {
            setActiveStep(1);
            setError('');
            toast.success('Hesabınız başarıyla oluşturuldu!', {
              position: "top-center",
              autoClose: 3000
            });
            toast.info('Doğrulama kodu telefonunuza gönderildi!', {
              position: "top-center",
              autoClose: 5000
            });
          } else {
            // Backend duplicate key hatası için özel mesaj
            if (response?.message && (response.message.includes('already exists') || response.message.includes('duplicate'))) {
              setError('Bu numarayla daha önce kaydoldu');
              toast.error('Bu numarayla daha önce kaydoldu', {
                position: "top-center",
                autoClose: 5000
              });
              return;
            }
            throw new Error(response?.message || 'Kayıt işlemi başarısız oldu');
          }
        } else {
          if (!verificationCode) {
            toast.error('Lütfen doğrulama kodunu giriniz!', {
              position: "top-center",
              autoClose: 3000
            });
            return;
          }

          const verifyResponse = await AuthService.verifyPhone(verificationCode);

          if (verifyResponse && verifyResponse.success) {
            setError('');
            toast.success('🎉 Tebrikler! Kayıt işlemi başarıyla tamamlandı!', {
              position: "top-center",
              autoClose: 3000
            });
            
            setTimeout(() => {
              navigate('/login', {
                state: { 
                  message: 'Kayıt işleminiz başarıyla tamamlandı! Şimdi giriş yapabilirsiniz.',
                  type: 'success'
                }
              });
            }, 3000);
          } else {
            throw new Error(verifyResponse?.message || 'Doğrulama işlemi başarısız oldu');
          }
        }
      } catch (err) {
        console.error('Kayıt/Doğrulama Hatası:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          formValues: {
            ...formik.values,
            password: '[GİZLİ]'
          }
        });

        // Backend duplicate key hatası için özel mesaj
        if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate'))) {
          setError('Bu numarayla daha önce kaydoldu');
          toast.error('Bu numarayla daha önce kaydoldu', {
            position: "top-center",
            autoClose: 5000
          });
        } else {
          const errorMessage = err.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
          setError(errorMessage);
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 5000
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleResendCode = async () => {
    try {
      const response = await AuthService.resendSmsCode(formik.values.telephone);
      if (response.success) {
        setError('');
        toast.info('Doğrulama kodu tekrar gönderildi!', {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'SMS kodu gönderilirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000
      });
    }
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
              Yeni Hesap Oluştur
            </Typography>
          </Box>

          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 4,
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#1976d2',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#1976d2',
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            {activeStep === 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="Ad"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Soyad"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="telephone"
                    name="telephone"
                    label="Telefon Numarası (Örn: 05366543708)"
                    value={formik.values.telephone}
                    onChange={handlePhoneChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.telephone && Boolean(formik.errors.telephone)}
                    helperText={formik.touched.telephone && formik.errors.telephone}
                    inputProps={{
                      maxLength: 11,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      placeholder: '05366543708'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
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
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Şifre Tekrarı"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
                    Telefonunuza gönderilen doğrulama kodunu giriniz
                  </Typography>
                  <TextField
                    fullWidth
                    id="verificationCode"
                    label="SMS Doğrulama Kodu"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Sms color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={handleResendCode}
                    sx={{
                      mb: 2,
                      color: '#1976d2',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    Kodu Tekrar Gönder
                  </Button>
                </Grid>
              </Grid>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                height: 48,
                background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #42a5f5 90%)',
                }
              }}
            >
              {isSubmitting ? 'İşleniyor...' : (activeStep === 0 ? 'Kayıt Ol' : 'Doğrula')}
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
                    Zaten hesabınız var mı? Giriş yapın
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

export default Register; 