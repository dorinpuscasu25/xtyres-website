import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languages = [
  {
    code: 'ro',
    label: 'Română',
    flag: '🇲🇩'
  },
  {
    code: 'ru',
    label: 'Русский',
    flag: '🇷🇺'
  }];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors text-sm font-medium">
        
        <span>{currentLang.flag}</span>
        <span className="uppercase">{currentLang.code}</span>
        <ChevronDownIcon className="w-3 h-3" />
      </button>

      {isOpen &&
      <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-100">
          {languages.map((lang) =>
        <button
          key={lang.code}
          onClick={() => {
            setLocale(lang.code as any);
            setIsOpen(false);
          }}
          className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-slate-50 transition-colors ${locale === lang.code ? 'text-amber-500 font-bold' : 'text-slate-700'}`}>
          
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
        )}
        </div>
      }
    </div>);

}
