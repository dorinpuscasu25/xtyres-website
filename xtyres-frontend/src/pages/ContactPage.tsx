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
import { getPhoneHref } from '../lib/contact';

const GOOGLE_MAPS_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4256.413566141774!2d28.875919500000002!3d47.0290044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97da956281505%3A0xaf03391942035628!2sCentru%20de%20anvelope%20Xtyres!5e1!3m2!1sen!2s!4v1785919557145!5m2!1sen!2s';

interface ContactPageProps {
  onNavigate: NavigateFn;
}
export function ContactPage({ onNavigate }: ContactPageProps) {
  const { t } = useTranslation();
  const { bootstrap } = useStorefront();
  const settings = bootstrap?.settings;
  const primaryPhone = settings?.phones?.[0] || '0 61 11 66 65';
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="flex items-start bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <MapPinIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  {t('contact.address')}
                </h3>
                <p className="text-slate-600 text-lg">
                  {settings?.contactAddress || t('footer.default_address')}
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <PhoneIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  {t('contact.phone')}
                </h3>
                <a
                  href={getPhoneHref(primaryPhone)}
                  className="text-slate-600 hover:text-amber-600 transition-colors text-lg font-medium">
                  {primaryPhone}
                </a>
              </div>
            </div>

            <div className="flex items-start bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <MailIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  {t('contact.email')}
                </h3>
                <p className="text-slate-600 text-lg">
                  {settings?.emails?.[0] || 'info@xtyres.md'}
                </p>
              </div>
            </div>

            <div className="flex items-start bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-6">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 uppercase tracking-wider mb-2">
                  {t('contact.schedule')}
                </h3>
                <p className="text-slate-600 text-lg">
                  {settings?.workingHours || t('footer.default_hours')}
                </p>
              </div>
            </div>
        </motion.div>

        <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
          <iframe
            src={GOOGLE_MAPS_EMBED_URL}
            title="Centru de anvelope Xtyres pe Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin">
          </iframe>
        </div>
      </div>
    </main>);

}
