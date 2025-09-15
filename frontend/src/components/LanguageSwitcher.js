import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = ({ size = 'small', showLabel = false, standalone = false }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    if (standalone) {
      // If standalone, use the language context
      changeLanguage(newLanguage);
    } else {
      // If not standalone, call the provided onChange
      if (changeLanguage) {
        changeLanguage(newLanguage);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-slate-400 font-medium">
          {t('language')}:
        </span>
      )}
      <div className="flex items-center bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-700/50 p-1 shadow-lg">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
            currentLanguage === 'en'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
              : 'text-white bg-slate-700/30 hover:bg-blue-700/50 hover:shadow-md border border-slate-600/50 hover:border-blue-500/50'
          }`}
        >
          {size === 'small' ? 'EN' : t('english')}
        </button>
        <button
          onClick={() => handleLanguageChange('ml')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
            currentLanguage === 'ml'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
              : 'text-white bg-slate-700/30 hover:bg-blue-700/50 hover:shadow-md border border-slate-600/50 hover:border-blue-500/50'
          }`}
        >
          {size === 'small' ? 'മലയാളം' : t('malayalam')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;