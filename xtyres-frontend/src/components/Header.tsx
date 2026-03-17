import { useState } from 'react';
import {
  PhoneIcon,
  ClockIcon,
  MapPinIcon,
  ShoppingCartIcon,
  MenuIcon,
  XIcon,
  FacebookIcon,
  InstagramIcon,
  ChevronDownIcon } from
'lucide-react';
import { useTranslation } from '../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SearchBar } from './SearchBar';
import { useCart } from '../lib/cart';
import { CartDropdown } from './CartDropdown';
import { useStorefront } from '../lib/storefront';
import { NavigateFn } from '../lib/navigation';
const TikTokIcon = ({ className }: {className?: string;}) =>
<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className={className}>
  
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>;

interface HeaderProps {
  onNavigate: NavigateFn;
}
export function Header({ onNavigate }: HeaderProps) {
  const { t } = useTranslation();
  const { totalItems } = useCart();
  const { bootstrap } = useStorefront();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settings = bootstrap?.settings;
  const menu = bootstrap?.menu ?? [];
  const socialMap = {
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    tiktok: TikTokIcon
  } as const;
  const handleNav = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };
  return (
    <header className="w-full sticky top-0 z-50 flex flex-col shadow-sm">
      <div className="bg-slate-900 text-slate-300 py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-white">
                {settings?.phones?.[0] || '+373 61 11 66 65'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-amber-500" />
              <span>{settings?.workingHours || 'Luni - Sâmbătă, 8:30 - 18:30'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-amber-500" />
              <span>{settings?.contactAddress || 'mun. Chișinău, str. Vadul lui Vodă 21/1'}</span>
            </div>

            <div className="flex items-center space-x-3 border-l border-slate-700 pl-6">
              {(settings?.socialLinks || []).slice(0, 3).map((item) => {
                const Icon = socialMap[item.name as keyof typeof socialMap];
                if (!Icon) return null;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-amber-500 transition-colors">
                    
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            <div className="border-l border-slate-700 pl-6">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNav('home')}>
            
            {settings?.headerLogoUrl ?
            <img
              src={settings.headerLogoUrl}
              alt={settings.siteName}
              className="h-10 w-auto object-contain" /> :
            <span className="text-2xl font-heading font-extrabold tracking-tight text-slate-900 flex items-baseline">
                {settings?.siteName || 'XTyres'}
                <span className="text-amber-500 text-3xl leading-none">.</span>md
              </span>
            }
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => handleNav('home')}
              className="text-slate-900 font-medium hover:text-amber-500 transition-colors relative group py-2">
              
              {t('nav.home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
            </button>

            {menu.map((category) =>
            <div key={category.id} className="relative group py-2">
                <button
                onClick={() =>
                onNavigate('products', {
                  categorySlug: category.slug
                })
                }
                className="flex items-center text-slate-900 font-medium hover:text-amber-500 transition-colors">
                
                  {category.name}
                  {category.children.length > 0 &&
                <ChevronDownIcon className="w-4 h-4 ml-1" />
                }
                </button>
                {category.children.length > 0 &&
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-md border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="py-2">
                      {category.children.map((child) =>
                  <button
                    key={child.id}
                    onClick={() =>
                    onNavigate('products', {
                      categorySlug: child.slug
                    })
                    }
                    className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:text-amber-500 hover:bg-slate-50">
                    
                          {child.name}
                        </button>
                  )}
                    </div>
                  </div>
              }
              </div>
            )}

            <button
              onClick={() => handleNav('about')}
              className="text-slate-900 font-medium hover:text-amber-500 transition-colors relative group py-2">
              
              {t('nav.about')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
            </button>
            <button
              onClick={() => handleNav('contact')}
              className="text-slate-900 font-medium hover:text-amber-500 transition-colors relative group py-2">
              
              {t('nav.contact')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
            </button>
          </nav>

          <div className="flex items-center space-x-4 flex-grow justify-end lg:flex-grow-0">
            <div className="hidden md:block w-64">
              <SearchBar onNavigate={onNavigate} />
            </div>

            <div className="relative group py-2">
              <button
                onClick={() => handleNav('cart')}
                aria-label="Cart"
                className="text-slate-900 hover:text-amber-500 transition-colors relative p-2">
                
                <ShoppingCartIcon className="w-6 h-6" />
                {totalItems > 0 &&
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-xs font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                }
              </button>
              <CartDropdown onNavigate={onNavigate} />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-slate-900 hover:text-amber-500 transition-colors p-2"
              aria-label="Open menu">
              
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen &&
      <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="text-xl font-bold text-slate-900">
                {settings?.siteName || 'XTyres'}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-2">
                
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
              <div className="mb-6">
                <SearchBar onNavigate={onNavigate} />
              </div>

              <nav className="space-y-4">
                <button
                  onClick={() => handleNav('home')}
                  className="block w-full text-left py-2 text-slate-900 font-medium hover:text-amber-500 transition-colors">
                  
                  {t('nav.home')}
                </button>

                {menu.map((category) =>
                <div key={category.id} className="border-t border-slate-100 pt-4">
                    <button
                    onClick={() =>
                    onNavigate('products', {
                      categorySlug: category.slug
                    })
                    }
                    className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                    
                      {category.name}
                    </button>
                    {category.children.length > 0 &&
                  <div className="space-y-2 pl-4">
                        {category.children.map((child) =>
                    <button
                      key={child.id}
                      onClick={() =>
                      onNavigate('products', {
                        categorySlug: child.slug
                      })
                      }
                      className="block w-full text-left py-2 text-slate-700 hover:text-amber-500 transition-colors">
                      
                            {child.name}
                          </button>
                    )}
                      </div>
                  }
                  </div>
                )}

                <button
                  onClick={() => handleNav('about')}
                  className="block w-full text-left py-2 text-slate-900 font-medium hover:text-amber-500 transition-colors">
                  
                  {t('nav.about')}
                </button>
                <button
                  onClick={() => handleNav('contact')}
                  className="block w-full text-left py-2 text-slate-900 font-medium hover:text-amber-500 transition-colors">
                  
                  {t('nav.contact')}
                </button>
              </nav>
            </div>
          </div>
        </div>
      }
    </header>);

}
