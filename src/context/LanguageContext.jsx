import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('gandhi_shop_lang');
      return saved === 'ta' ? 'ta' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gandhi_shop_lang', language);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
    // Update HTML lang attribute for accessibility and SEO
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'ta' : 'en');
  };

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ta') {
      setLanguageState(lang);
    }
  };

  /**
   * Translate key with optional parameter replacements (e.g. {count}, {pct})
   */
  const t = (key, params = {}) => {
    if (!key) return '';
    const keys = key.split('.');
    
    // Attempt lookup in active language
    let value = TRANSLATIONS[language];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        value = null;
        break;
      }
    }

    // Fallback to English if translation is missing
    if (value === null && language !== 'en') {
      let fallback = TRANSLATIONS.en;
      for (const k of keys) {
        if (fallback && fallback[k] !== undefined) {
          fallback = fallback[k];
        } else {
          fallback = null;
          break;
        }
      }
      value = fallback;
    }

    if (value === null || typeof value !== 'string') {
      return key;
    }

    // Replace parameter placeholders
    let result = value;
    Object.keys(params).forEach(pKey => {
      result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), params[pKey]);
    });

    return result;
  };

  /**
   * Helper to translate category names
   */
  const translateCategory = (catName) => {
    if (!catName) return '';
    if (CATEGORY_TRANSLATIONS[catName] && CATEGORY_TRANSLATIONS[catName][language]) {
      return CATEGORY_TRANSLATIONS[catName][language];
    }
    return catName;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
