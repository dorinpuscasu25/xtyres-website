import { motion } from 'framer-motion';
import { WrenchIcon, CircleDotIcon, SettingsIcon } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
export function ServicesSection() {
  const { t } = useTranslation();
  const services = [
  {
    title: t('service.vulcanization.title'),
    description: t('service.vulcanization.description'),
    icon: <WrenchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
  },
  {
    title: t('service.balance.title'),
    description: t('service.balance.description'),
    icon: <CircleDotIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
  },
  {
    title: t('service.rims.title'),
    description: t('service.rims.description'),
    icon: <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
  }];

  return (
    <section id="services" className="py-24 px-4 bg-slate-900 text-white relative overflow-hidden scroll-mt-24">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/30 skew-x-12 translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white uppercase tracking-wide mb-4">
            {t('section.services')}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {t('section.services_subtitle')}
          </p>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Updated to grid-cols-2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          {services.map((service, index) =>
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 30
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.2
            }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-8 text-center hover:bg-slate-800 transition-colors duration-300">
            
              <div className="w-12 h-12 sm:w-20 sm:h-20 mx-auto bg-amber-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-amber-500/20">
                {service.icon}
              </div>
              <h3 className="text-sm sm:text-xl font-heading font-bold text-white mb-2 sm:mb-4 uppercase tracking-wider">
                {service.title}
              </h3>
              <p className="text-xs sm:text-base text-slate-400 leading-relaxed hidden sm:block">
                {service.description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
