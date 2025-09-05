import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="relative">
      <button
        onClick={() => changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
        className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-2"
        title={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium uppercase">{i18n.language}</span>
      </button>
    </div>
  );
};

export default LanguageSelector;