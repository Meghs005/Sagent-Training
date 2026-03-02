import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('groceryUser')); } catch { return null; }
  });
  const login = (u) => { setUser(u); localStorage.setItem('groceryUser', JSON.stringify(u)); };
  const logout = () => { setUser(null); localStorage.removeItem('groceryUser'); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
