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
  (error) => {
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

      const formData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        telephone: userData.telephone,
        password: userData.password
      };

      console.log('Backend\'e gönderilecek veriler:', {
        ...formData,
        password: '[GİZLİ]'
      });

      const response = await axiosInstance.post('/user/sign-up', formData);
      
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
      console.log('Giriş isteği gönderiliyor:', { telephone });

      const formData = {
        telephone: telephone,
        password: password
      };

      console.log('Backend\'e gönderilecek giriş verileri:', {
        ...formData,
        password: '[GİZLİ]'
      });

      const response = await axiosInstance.post('/user/sign-in', formData);
      
      console.log('Giriş yanıtı:', {
        status: response.status,
        data: response.data
      });

      const data = response.data;

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token başarıyla kaydedildi');
        return { success: true, data };
      } else {
        console.warn('Token alınamadı:', data);
        throw new Error(data?.message || 'Giriş başarısız oldu');
      }
    } catch (error) {
      console.error('Giriş hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
  verifyPhone: async (code, telephone) => {
    try {
      const response = await axiosInstance.post('/verify/phone', {
        code,
        phone: telephone
      });

      const data = response.data;

      if (data && data.success && data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
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
      const response = await axiosInstance.post('/user/forgot-password', { telephone });
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
};

export default AuthService; 