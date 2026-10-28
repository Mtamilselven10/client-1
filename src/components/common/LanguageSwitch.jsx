import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitch({ className = "", isInline = false }) {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  return (
    <div
      data-testid="language-switch"
      className={`${
        isInline
          ? 'relative flex items-center shadow-xs'
          : 'fixed top-3.5 right-14 lg:right-6 sm:top-4 z-50 flex items-center shadow-olive-md'
      } rounded-full bg-cream-light/95 backdrop-blur-md border border-olive/30 p-1 transition-all hover:border-olive ${className}`}
      role="region"
      aria-label="Language selection"
    >
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 px-1.5 pl-2 text-olive focus-visible:outline-none"
        title={language === 'en' ? 'தமிழில் மாற்றவும்' : 'Switch to English'}
        aria-label={t('nav.switchLanguage')}
      >
        <Globe className="w-3.5 h-3.5 text-olive shrink-0" />
      </button>

      {/* Segmented Switch Pill */}
      <div className="flex items-center bg-cream-deep/60 rounded-full p-0.5 border border-olive/15 text-xs font-bold">
        {/* English Option */}
        <button
          data-testid="lang-btn-en"
          onClick={() => setLanguage('en')}
          className={`relative px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-olive ${
            language === 'en' ? 'text-cream' : 'text-olive hover:text-olive-dark'
          }`}
          aria-pressed={language === 'en'}
        >
          {language === 'en' && (
            <motion.div
              layoutId="languageIndicator"
              className="absolute inset-0 bg-olive rounded-full shadow-xs"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10">EN</span>
        </button>

        {/* Tamil Option */}
        <button
          data-testid="lang-btn-ta"
          onClick={() => setLanguage('ta')}
          className={`relative px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-olive ${
            language === 'ta' ? 'text-cream' : 'text-olive hover:text-olive-dark'
          }`}
          aria-pressed={language === 'ta'}
        >
          {language === 'ta' && (
            <motion.div
              layoutId="languageIndicator"
              className="absolute inset-0 bg-olive rounded-full shadow-xs"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10">தமிழ்</span>
        </button>
      </div>
    </div>
  );
}
