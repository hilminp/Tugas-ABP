import React, { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { api } from '../lib/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(Boolean(sessionStorage.getItem('access_token')));

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoading(false);
    sessionStorage.removeItem('access_token');
  };

  const login = (userData, accessToken) => {
    setUser(userData);
    setLoading(true);
    setToken(accessToken);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    if (!token) {
      sessionStorage.removeItem('access_token');
      return;
    }

    let isMounted = true;
    sessionStorage.setItem('access_token', token);

    api
      .get('/profile')
      .then((res) => {
        if (isMounted) setUser(res.data);
      })
      .catch(() => {
        if (isMounted) logout();
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>{children}</AuthContext.Provider>;
};
