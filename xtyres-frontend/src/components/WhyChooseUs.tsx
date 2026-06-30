import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  TruckIcon,
  BadgeCheckIcon,
  HeadphonesIcon } from
'lucide-react';
import { useTranslation } from '../lib/i18n';
export function WhyChooseUs() {
  const { t } = useTranslation();
  const features = [
  {
    icon: <ShieldCheckIcon className="w-10 h-10 text-amber-500" />,
    title: t('why.warranty.title'),
    desc: t('why.warranty.desc')
  },
  {
    icon: <TruckIcon className="w-10 h-10 text-amber-500" />,
    title: t('why.delivery.title'),
    desc: t('why.delivery.desc')
  },
  {
    icon: <BadgeCheckIcon className="w-10 h-10 text-amber-500" />,
    title: t('why.quality.title'),
    desc: t('why.quality.desc')
  },
  {
    icon: <HeadphonesIcon className="w-10 h-10 text-amber-500" />,
    title: t('why.support.title'),
    desc: t('why.support.desc')
  }];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) =>
          <motion.div
            key={index}
            className="flex flex-col items-center text-center group">
            
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-amber-50 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900 mb-2 uppercase tracking-wider">
                {feature.title}
              </h3>
              <p className="text-slate-500">{feature.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
