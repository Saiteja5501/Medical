import React, { createContext, useEffect, useState, useContext } from 'react';

// Define the list of authentication keys we manage.
const AUTH_KEYS = [
  'token',
  'isLoggedIn',
  'role',
  'userId',
  'userName',
  'email',
  'patientId',
  'doctorId'
];

// Default guest authentication state.
const defaultAuth = {
  token: null,
  isLoggedIn: false,
  role: 'guest',
  userId: null,
  userName: '',
  email: '',
  patientId: null,
  doctorId: null
};

export const AuthContext = createContext({
  ...defaultAuth,
  setAuth: () => {},
  clearAuth: () => {}
});

export const AuthProvider = ({ children }) => {
  // Initialise auth from sessionStorage, falling back to defaults.
  const initAuth = () => {
    const stored = {};
    AUTH_KEYS.forEach((key) => {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        if (key === 'isLoggedIn') {
          stored[key] = value === 'true';
        } else {
          stored[key] = value;
        }
      }
    });
    return { ...defaultAuth, ...stored };
  };

  const [auth, setAuthState] = useState(initAuth);

  // Persist the whole auth object to sessionStorage whenever it changes.
  useEffect(() => {
    AUTH_KEYS.forEach((key) => {
      const value = auth[key];
      if (value === null || value === undefined) {
        sessionStorage.removeItem(key);
      } else {
        const storedValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
        sessionStorage.setItem(key, storedValue);
      }
    });
  }, [auth]);

  // Helper that merges a partial auth object into the current state.
  const setAuth = (partial) => {
    setAuthState((prev) => ({ ...prev, ...partial }));
  };

  // Helper that clears all known auth keys and resets context to defaults.
  const clearAuth = () => {
    AUTH_KEYS.forEach((key) => sessionStorage.removeItem(key));
    setAuthState({ ...defaultAuth });
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenient hook for consumers.
export const useAuth = () => useContext(AuthContext);
