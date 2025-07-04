import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const loginAction = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logoutAction = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = { token, user, setUser, loginAction, logoutAction };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};