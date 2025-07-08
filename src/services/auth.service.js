import axios from 'axios';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: '/api',  // Vite proxy üzerinden yönlendirilecek
  timeout: 15000,   // 15 saniye timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - token ekleme
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // İstek detaylarını logla
    console.log('🚀 İstek gönderiliyor:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      data: config.data ? {
        ...config.data,
        password: config.data.password ? '[GİZLİ]' : undefined
      } : undefined
    });
    return config;
  },
  (error) => {
    console.error('❌ İstek hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Başarılı yanıtı logla
    console.log('✅ Başarılı yanıt:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      url: response.config.url
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Token expired ise ve daha önce refresh denenmediyse
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const data = await AuthService.refreshToken(refreshToken);
          if (data.success && data.accessToken && data.refreshToken) {
            localStorage.setItem('accessToken', data.accessToken.token);
            localStorage.setItem('refreshToken', data.refreshToken.token);
            // Yeni token ile isteği tekrar dene
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken.token}`;
            return axiosInstance(originalRequest);
          } else {
            // Refresh başarısızsa logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(new Error(data.message || 'Oturum süresi doldu. Lütfen tekrar giriş yapın.'));
          }
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    // Hata detaylarını logla
    console.error('❌ Axios Hatası:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
    if (error.response?.status === 403) {
      // Token geçersiz veya süresi dolmuş olabilir
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Error handler
const handleError = (error) => {
  console.error('Hata İşleme Detayları:', {
    originalError: {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    },
    response: {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    },
    request: {
      url: error.config?.url ? `${error.config.baseURL}${error.config.url}` : undefined,
      method: error.config?.method,
      headers: error.config?.headers
    }
  });

  if (error.code === 'ECONNABORTED') {
    throw new Error('Sunucu yanıt vermedi. Lütfen daha sonra tekrar deneyin.');
  }

  if (!error.response) {
    throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve backend sunucusunun çalıştığını kontrol edin.');
  }

  // Eğer backend 401 döndürdü ve response.data yoksa, özel mesaj ver
  if (error.response.status === 401 && !error.response.data) {
    throw new Error('Girilen şifre ile telefon numarası eşleşmiyor');
  }

  // Backend'den gelen hata mesajını kullan
  const errorMessage = error.response?.data?.message 
    || error.response?.data?.error 
    || error.message 
    || 'Bir hata oluştu';

  throw new Error(errorMessage);
};

const AuthService = {
  // Test bağlantısı
  testConnection: async () => {
    try {
      console.log('Backend bağlantısı test ediliyor...');
      const response = await axiosInstance.options('/user/sign-up');
      console.log('Backend bağlantı testi başarılı:', response.data);
      return true;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('Backend çalışıyor ama yetkilendirme gerekiyor');
        return true;
      }
      console.error('Backend bağlantı testi başarısız:', error);
      return false;
    }
  },

  // Kayıt olma işlemi
  register: async (userData) => {
    try {
      console.log('Register isteği başlatılıyor:', {
        ...userData,
        password: '[GİZLİ]'
      });

      // Telefon numarasını +90 ile başlat
      let telephone = userData.telephone;
      if (!telephone.startsWith('+90')) {
        telephone = '+90' + telephone.replace(/^0/, '');
      }

      const formData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        telephone: telephone,
        password: userData.password,
        deviceUuid: userData.deviceUuid,
        fcmToken: userData.fcmToken
      };

      console.log('Backend\'e gönderilecek veriler:', {
        ...formData,
        password: '[GİZLİ]'
      });

      const response = await axios.post('http://localhost:8080/v1/api/user/sign-up', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Backend\'den gelen yanıt:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error) {
      console.error('Register hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return handleError(error);
    }
  },

  // Giriş yapma işlemi
  login: async (telephone, password) => {
    try {
      // Telefon numarasını +90 ile başlat
      if (!telephone.startsWith('+90')) {
        telephone = '+90' + telephone.replace(/^0/, '');
      }
      const formData = {
        telephone: telephone,
        password: password
      };
      const response = await axios.post('http://localhost:8080/v1/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = response.data;
      // Yeni cihaz algılandıysa özel durum
      if (data && data.message && data.message.includes('Yeni cihaz algılandı')) {
        return { success: false, newDevice: true, message: data.message };
      }
      if (data && data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken.token);
        localStorage.setItem('refreshToken', data.refreshToken.token);
        return { success: true, data };
      } else {
        throw new Error(data?.message || 'Giriş başarısız oldu');
      }
    } catch (error) {
      return handleError(error);
    }
  },

  // Yeni cihaz için SMS doğrulama
  phoneVerify: async ({ code, ipAddress, deviceInfo, appVersion, platform }) => {
    try {
      const response = await axios.post('http://localhost:8080/v1/api/auth/phone-verify', {
        code,
        ipAddress,
        deviceInfo,
        appVersion,
        platform
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = response.data;
      if (data && data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken.token);
        localStorage.setItem('refreshToken', data.refreshToken.token);
        return { success: true, data };
      } else {
        throw new Error(data?.message || 'Doğrulama başarısız oldu');
      }
    } catch (error) {
      return handleError(error);
    }
  },

  // Çıkış yapma işlemi
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  // Token kontrolü
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // SMS doğrulama
  verifyPhone: async (code) => {
    try {
      const response = await axios.post('http://localhost:8080/v1/api/user/verify/phone', { code }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // SMS kodunu tekrar gönderme
  resendSmsCode: async (telephone) => {
    try {
      const response = await axiosInstance.post('/resend-sms', { telephone });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Profil bilgilerini getirme
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Şifremi unuttum
  forgotPassword: async (telephone) => {
    try {
      const response = await axios.post(`http://localhost:8080/v1/api/user/password/forgot?phone=${telephone}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Şifre sıfırlama
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosInstance.post('/user/reset-password', {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Şifre değiştirme
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await axiosInstance.put('/user/change-password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Profil güncelleme
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Profil fotoğrafı yükleme
  uploadProfilePhoto: async (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    const response = await axios.put(`${API_URL}/kullanici/profil-fotografi-koy`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Hesap silme
  deleteAccount: async () => {
    const response = await axios.delete(`${API_URL}/kullanici/hesabimi-sil`);
    return response.data;
  },

  // Toplu kullanıcı ekleme
  registerMultiple: async (users) => {
    const response = await axios.get(`${API_URL}/kullanici/toplu-kullanici-ekleme`, { params: { users } });
    return response.data;
  },

  // Şifre sıfırlama kodu doğrulama
  passwordVerifyCode: async (verificationCodeRequest) => {
    try {
      const response = await axios.post('http://localhost:8080/v1/api/user/password/verify-code', verificationCodeRequest);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Yeni şifre belirleme
  passwordReset: async ({ resetToken, newPassword }) => {
    try {
      const response = await axios.post('http://localhost:8080/v1/api/user/password/reset', { resetToken, newPassword });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Refresh token fonksiyonu
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post('http://localhost:8080/v1/api/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

export default AuthService; 