/**
 * ThemeContext - إدارة حالة الثيم (فاتح/داكن)
 * يوفر:
 * - التبديل بين الوضع الفاتح والداكن
 * - حفظ اختيار المستخدم في localStorage
 * - تطبيق الثيم على كامل التطبيق
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      // Check localStorage first
      const savedTheme = localStorage.getItem('triply-theme');
      if (savedTheme) {
        return savedTheme;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    
    // Check system preference
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (error) {
      console.error('Error checking system preference:', error);
    }
    
    return 'light';
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      
      // Remove opposite theme class
      root.classList.remove(theme === 'dark' ? 'light' : 'dark');
      
      // Add current theme class
      root.classList.add(theme);
      
      // Save to localStorage
      localStorage.setItem('triply-theme', theme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}



