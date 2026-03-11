import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

// ── Determina el tema inicial SIN localStorage para evitar flash ──
// El script en index.html ya aplica el tema antes que React monte.
// Aquí solo leemos lo que ya está en el DOM.
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const saved = localStorage.getItem('naama-theme');
  if (saved === 'light' || saved === 'dark') return saved;

  // Sin preferencia guardada → usa hora del día
  const hour = new Date().getHours();
  return (hour >= 20 || hour < 7) ? 'dark' : 'light';
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [isAutoMode, setIsAutoMode] = useState(() => !localStorage.getItem('naama-theme'));

  // Aplica el atributo al <html> cada vez que cambia el tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // También fija el color de la barra de estado en móvil
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#141210' : '#F9F7F2');
  }, [theme]);

  // Auto-switch por hora (solo en modo automático)
  useEffect(() => {
    if (!isAutoMode) return;

    const checkTime = () => {
      const hour = new Date().getHours();
      setTheme((hour >= 20 || hour < 7) ? 'dark' : 'light');
    };

    const interval = setInterval(checkTime, 60_000);
    return () => clearInterval(interval);
  }, [isAutoMode]);

  const toggleTheme = () => {
    setIsAutoMode(false);
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('naama-theme', next);
      return next;
    });
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