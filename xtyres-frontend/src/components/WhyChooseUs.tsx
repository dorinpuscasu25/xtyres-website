import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  TruckIcon,
  BadgeCheckIcon,
  HeadphonesIcon } from
'lucide-react';
export function WhyChooseUs() {
  const features = [
  {
    icon: <ShieldCheckIcon className="w-10 h-10 text-amber-500" />,
    title: 'Garanție',
    desc: 'Toate produsele cu garanție oficială'
  },
  {
    icon: <TruckIcon className="w-10 h-10 text-amber-500" />,
    title: 'Livrare Rapidă',
    desc: 'Livrare în toată Moldova'
  },
  {
    icon: <BadgeCheckIcon className="w-10 h-10 text-amber-500" />,
    title: 'Calitate Premium',
    desc: 'Doar branduri de încredere'
  },
  {
    icon: <HeadphonesIcon className="w-10 h-10 text-amber-500" />,
    title: 'Suport 24/7',
    desc: 'Suntem mereu la dispoziția ta'
  }];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) =>
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 20
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
              delay: index * 0.1
            }}
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