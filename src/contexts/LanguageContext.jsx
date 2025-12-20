import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../i18n/en";
import ar from "../i18n/ar";

const translations = { en, ar };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Default to Arabic unless a previous choice exists
    return localStorage.getItem("lang") || "ar";
  });

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    localStorage.setItem("lang", language);
  }, [language]);

  const t = (key, options = {}) => {
    const keys = key.split(".");
    let value = translations[language];
    for (let k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    
    // Support returnObjects option for arrays/objects
    if (options.returnObjects) {
      return value || key;
    }
    
    // If value is not found, return the key
    if (!value) return key;
    
    // Handle string interpolation
    if (typeof value === 'string' && options) {
      // Replace {variable} with actual values from options
      return value.replace(/\{(\w+)\}/g, (match, variable) => {
        return options[variable] !== undefined ? options[variable] : match;
      });
    }
    
    return value;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
