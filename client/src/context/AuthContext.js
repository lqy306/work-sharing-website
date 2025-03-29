import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 设置请求头
        axios.defaults.headers.common['x-auth-token'] = token;
        
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setError(err.response?.data?.message || '加载用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 注册用户
  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      await loadUser();
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || '注册失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登录用户
  const login = async (formData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', formData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      const userRes = await axios.get('/api/auth/me');
      setUser(userRes.data);
      setIsAuthenticated(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || '登录失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登出用户
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // 加载用户信息
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || '加载用户信息失败');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
