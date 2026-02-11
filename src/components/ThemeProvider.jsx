import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('naama-theme');
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    
    // Auto by time of day (dark after 20:00, light after 07:00)
    const hour = new Date().getHours();
    return (hour >= 20 || hour < 7) ? 'dark' : 'light';
  });

  const [isAutoMode, setIsAutoMode] = useState(() => {
    return !localStorage.getItem('naama-theme');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto-switch by time every minute
  useEffect(() => {
    if (!isAutoMode) return;
    
    const checkTime = () => {
      const hour = new Date().getHours();
      const shouldBeDark = hour >= 20 || hour < 7;
      setTheme(shouldBeDark ? 'dark' : 'light');
    };

    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [isAutoMode]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsAutoMode(false);
    localStorage.setItem('naama-theme', newTheme);
  };

  const setAutoMode = () => {
    localStorage.removeItem('naama-theme');
    setIsAutoMode(true);
    const hour = new Date().getHours();
    setTheme((hour >= 20 || hour < 7) ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAutoMode, setAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
