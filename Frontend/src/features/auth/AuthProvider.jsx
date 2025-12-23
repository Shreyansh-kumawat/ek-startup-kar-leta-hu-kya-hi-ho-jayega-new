import React from 'react';
import { AuthProvider as AuthContextProvider } from '../../context/AuthContext';

// This is a wrapper component that can be used to provide additional auth-related functionality
const AuthProvider = ({ children }) => {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
};

export default AuthProvider;