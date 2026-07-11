import React, { createContext, useEffect, useState } from 'react';

// AuthContext provides authentication state (logged‑in, role) and a helper to refresh it.
export const AuthContext = createContext({
  isLoggedIn: false,
  role: 'guest',
  setAuth: () => {}
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
    role: sessionStorage.getItem('role') || 'guest'
  });

  // Keep sessionStorage in sync with the context state.
  useEffect(() => {
    sessionStorage.setItem('isLoggedIn', auth.isLoggedIn ? 'true' : 'false');
    sessionStorage.setItem('role', auth.role);
  }, [auth]);

  // Listen for changes made in other tabs/windows.
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'isLoggedIn' || e.key === 'role') {
        setAuth({
          isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
          role: sessionStorage.getItem('role') || 'guest'
        });
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
