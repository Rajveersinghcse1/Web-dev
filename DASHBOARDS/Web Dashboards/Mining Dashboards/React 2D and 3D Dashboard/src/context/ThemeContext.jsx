// src/context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [lightMode, setLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  const toggleTheme = () => setLightMode(prev => !prev);

  useEffect(() => {
    document.body.style.backgroundColor = lightMode ? '#fff' : '#121212';
    document.body.style.color = lightMode ? '#000' : '#fff';
    localStorage.setItem('theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  return (
    <ThemeContext.Provider value={{ lightMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
