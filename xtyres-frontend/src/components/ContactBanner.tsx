import { motion } from 'framer-motion';
import { PhoneCallIcon } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { NavigateFn } from '../lib/navigation';

interface ContactBannerProps {
  onNavigate: NavigateFn;
}

export function ContactBanner({ onNavigate }: ContactBannerProps) {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 bg-amber-500 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-transparent to-transparent"></div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-wide mb-2">
            {t('contact_banner.title')}
          </h2>
          <p className="text-slate-800 text-lg font-medium">
            {t('contact_banner.subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center text-slate-900 font-bold text-2xl">
            <PhoneCallIcon className="w-6 h-6 mr-3" />0 61 11 66 65
          </div>
          <motion.button
            whileHover={{
              scale: 1.05
            }}
            whileTap={{
              scale: 0.95
            }}
            onClick={() => onNavigate('contact')}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md transition-colors uppercase tracking-wider text-sm shadow-xl">
            
            {t('btn.contact_us')}
          </motion.button>
        </div>
      </div>
    </section>);

}
