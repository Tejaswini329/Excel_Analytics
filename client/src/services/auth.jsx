import axios from 'axios';

// 1. Login function
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      'https://web-development-project-gxnx.onrender.com/api/auth/login', 
      { email, password }
    );
    
    // 2. Token ko localStorage me save karo
    localStorage.setItem('authToken', response.data.token);
    
    // 3. User data return karo (dashboard me use hoga)
    return response.data.user;
    
  } catch (error) {
    console.error('Login failed:', error.response.data);
    throw error;
  }
};

// 4. Har request ke liye token attach karo
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
