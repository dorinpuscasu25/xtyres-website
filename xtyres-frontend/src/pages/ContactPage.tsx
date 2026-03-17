import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  ChevronRightIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { useStorefront } from '../lib/storefront';
import { NavigateFn } from '../lib/navigation';
interface ContactPageProps {
  onNavigate: NavigateFn;
}
export function ContactPage({ onNavigate }: ContactPageProps) {
  const { t } = useTranslation();
  const { bootstrap } = useStorefront();
  const settings = bootstrap?.settings;
  return (
    <main className="flex-grow bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-slate-500 mb-8 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-amber-500 transition-colors">
            
            {t('nav.home')}
          </button>
          <ChevronRightIcon className="w-4 h-4 mx-2" />
          <span className="text-slate-900">{t('page.contact.title')}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-wide mb-12">
          {t('page.contact.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.5
            }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
            
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">
              Scrie-ne un mesaj
            </h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-md border border-slate-200 bg-slate-50"
                  placeholder="Numele tău" />
                
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-md border border-slate-200 bg-slate-50"
                  placeholder="Telefon" />
                
              </div>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-md border border-slate-200 bg-slate-50"
                placeholder="Email" />
              
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-md border border-slate-200 bg-slate-50 resize-none"
                placeholder="Cu ce te putem ajuta?">
              </textarea>
              <motion.button
                whileHover={{
                  scale: 1.02
                }}
                whileTap={{
                  scale: 0.98
                }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm">
                
                {t('btn.send_message')}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.2
            }}
            className="flex flex-col justify-center space-y-8">
            
            <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <MapPinIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Adresă
                </h3>
                <p className="text-slate-600 text-lg">
                  {settings?.contactAddress || 'mun. Chișinău, str. Vadul lui Vodă 21/1'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <PhoneIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Telefon
                </h3>
                <p className="text-slate-600 text-lg font-medium">
                  {settings?.phones?.[0] || '0 61 11 66 65'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <MailIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Email
                </h3>
                <p className="text-slate-600 text-lg">
                  {settings?.emails?.[0] || 'info@xtyres.md'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Program
                </h3>
                <p className="text-slate-600 text-lg">
                  {settings?.workingHours || 'Luni - Sâmbătă: 8:30 - 18:30'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="w-full h-96 bg-slate-200 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-300">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="flex flex-col items-center text-slate-500 z-10">
            <MapPinIcon className="w-12 h-12 mb-4 text-slate-400" />
            <span className="text-xl font-heading font-bold uppercase tracking-widest">
              Google Maps
            </span>
            <span className="text-sm mt-2">
              {settings?.contactAddress || 'mun. Chișinău, str. Vadul lui Vodă 21/1'}
            </span>
          </div>
        </div>
      </div>
    </main>);

}
