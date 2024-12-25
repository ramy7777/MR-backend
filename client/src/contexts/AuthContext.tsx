import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Found token in localStorage');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:3001/api/auth/me');
        const userData = response.data.data.user;
        console.log('User info from /me:', userData);
        
        // Make sure we include all required fields
        const userWithRole = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        };
        console.log('Setting user with role:', userWithRole);
        setUser(userWithRole);
      }
    } catch (err) {
      console.error('Token validation failed:', err);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });
      console.log('Login response:', response.data);
      const { user: userData, accessToken } = response.data.data;
      console.log('User data from login:', userData);
      console.log('Access token from login:', accessToken);
      
      // Make sure we include all required fields
      const userWithRole = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };
      console.log('Setting user with role:', userWithRole);
      
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userWithRole);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        email,
        password,
        name,
      });
      console.log('Register response:', response.data);
      const { user: userData, accessToken } = response.data.data;
      console.log('User data from register:', userData);
      console.log('Access token from register:', accessToken);
      
      // Make sure we include all required fields
      const userWithRole = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };
      console.log('Setting user with role:', userWithRole);
      
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userWithRole);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
