import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon } from
'lucide-react';
import { useStorefront } from '../lib/storefront';
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
export function Footer() {
  const { bootstrap } = useStorefront();
  const settings = bootstrap?.settings;
  const menu = bootstrap?.menu ?? [];
  const socialMap = {
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    tiktok: TikTokIcon
  } as const;
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-8 px-4 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <a
              href="#"
              className="text-2xl font-heading font-extrabold tracking-tight text-white flex items-baseline mb-6">
              
              {settings?.siteName || 'XTyres'}
              <span className="text-amber-500 text-3xl leading-none">.</span>md
            </a>
            <p className="text-slate-400 leading-relaxed mb-6">
              {settings?.footerText ||
              'Suntem magazinul tău de încredere pentru anvelope și servicii auto de calitate premium în Chișinău.'}
            </p>
            <div className="flex space-x-4">
              {(settings?.socialLinks || []).map((item) => {
                const Icon = socialMap[item.name as keyof typeof socialMap];
                if (!Icon) return null;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors">
                    
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading font-bold text-white uppercase tracking-wider mb-6">
              Serviciile Noastre
            </h3>
            <ul className="space-y-3">
              <li>Vulcanizare</li>
              <li>Echilibrare Roți</li>
              <li>Îndreptare Jante</li>
              <li>Montare Anvelope</li>
              <li>Diagnoză baterii</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-bold text-white uppercase tracking-wider mb-6">
              Link-uri Utile
            </h3>
            <ul className="space-y-3">
              {menu.map((category) =>
              <li key={category.id}>
                  <a href="#catalog" className="hover:text-amber-500 transition-colors">
                    {category.name}
                  </a>
                </li>
              )}
              <li>
                <a href="#" className="hover:text-amber-500 transition-colors">
                  Despre Noi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-bold text-white uppercase tracking-wider mb-6">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                <span>{settings?.contactAddress || 'mun. Chișinău, str. Vadul lui Vodă 21/1'}</span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                <span className="font-bold text-white">
                  {settings?.phones?.[0] || '0 61 11 66 65'}
                </span>
              </li>
              <li className="flex items-center">
                <MailIcon className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                <span>{settings?.emails?.[0] || 'info@xtyres.md'}</span>
              </li>
              <li className="flex items-start">
                <ClockIcon className="w-5 h-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="block text-white font-medium">
                    Program:
                  </span>
                  <span>{settings?.workingHours || 'Luni - Sâmbătă, 8:30 - 18:30'}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2026 {settings?.siteName || 'XTyres.md'} — Toate drepturile rezervate.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Termeni și Condiții
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Politica de Confidențialitate
            </a>
          </div>
        </div>
      </div>
    </footer>);

}
