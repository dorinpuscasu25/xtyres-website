import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon } from
'lucide-react';
import { useStorefront } from '../lib/storefront';
import { useTranslation } from '../lib/i18n';
import { buildRouteFromNavigation, updateBrowserUrl } from '../lib/router';
import { getPhoneHref, getSocialUrl } from '../lib/contact';
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

const DEFAULT_FOOTER_LOGO = '/assets/logos/xtyres-logo-yellow.svg';

export function Footer() {
  const { t } = useTranslation();
  const { bootstrap } = useStorefront();
  const settings = bootstrap?.settings;
  const primaryPhone = settings?.phones?.[0] || '0 61 11 66 65';
  const footerLogoUrl = settings?.footerLogoUrl || DEFAULT_FOOTER_LOGO;
  const menu = bootstrap?.menu ?? [];
  const socialMap = {
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    tiktok: TikTokIcon
  } as const;
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-8 px-4 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
          <div className="max-w-sm">
            <a
              href="#"
              className="inline-flex items-center mb-6">
              
              <img
                src={footerLogoUrl}
                alt={settings?.siteName || 'XTyres.md'}
                className="h-12 w-auto object-contain" />
            </a>
            <p className="text-slate-400 leading-relaxed mb-6">
              {settings?.footerText ||
              t('footer.default_text')}
            </p>
            <div className="flex space-x-4">
              {(settings?.socialLinks || []).map((item) => {
                const Icon = socialMap[item.name as keyof typeof socialMap];
                if (!Icon) return null;
                return (
                  <a
                    key={item.name}
                    href={getSocialUrl(item.name, item.url)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors">
                    
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:justify-self-center">
            <h3 className="text-lg font-heading font-bold text-white uppercase tracking-wider mb-6">
              {t('footer.useful_links')}
            </h3>
            <ul className="space-y-3">
              {menu.map((category) =>
              <li key={category.id}>
                  <a
                    href={`/catalog/${category.slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      updateBrowserUrl(buildRouteFromNavigation('products', {
                        categorySlug: category.slug,
                      }));
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="hover:text-amber-500 transition-colors">
                    {category.name}
                  </a>
                </li>
              )}
              <li>
                <a
                  href="/about"
                  onClick={(event) => {
                    event.preventDefault();
                    updateBrowserUrl(buildRouteFromNavigation('about'));
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="hover:text-amber-500 transition-colors">
                  {t('footer.about')}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1 lg:justify-self-end">
            <h3 className="text-lg font-heading font-bold text-white uppercase tracking-wider mb-6">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                <span>{settings?.contactAddress || t('footer.default_address')}</span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                <a
                  href={getPhoneHref(primaryPhone)}
                  className="font-bold text-white hover:text-amber-500 transition-colors">
                  {primaryPhone}
                </a>
              </li>
              <li className="flex items-center">
                <MailIcon className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                <span>{settings?.emails?.[0] || 'info@xtyres.md'}</span>
              </li>
              <li className="flex items-start">
                <ClockIcon className="w-5 h-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="block text-white font-medium">
                    {t('footer.schedule')}
                  </span>
                  <span>{settings?.workingHours || t('footer.default_hours')}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center md:text-left text-sm text-slate-500">
          <p>© 2026 {settings?.siteName || 'XTyres.md'} - {t('footer.rights')}</p>
        </div>
      </div>
    </footer>);

}
