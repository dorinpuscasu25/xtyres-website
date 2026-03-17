import { motion } from 'framer-motion';
import { WrenchIcon, CircleDotIcon, SettingsIcon } from 'lucide-react';
export function ServicesSection() {
  const services = [
  {
    title: 'Vulcanizare',
    description:
    'Reparatii anvelope, echilibrat roti, îndreptat jante, montat jante, montat anvelope, presiune cu aer-azot.',
    icon: <WrenchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
  },
  {
    title: 'Echilibrare Roți',
    description:
    'O roata echilibrata face diferenta intre un condus placut sau unul dezastruos.',
    icon: <CircleDotIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
  },
  {
    title: 'Îndreptare Jante',
    description:
    'Personal calificat si experimentat in acest domeniu, putand indrepta orice janta indiferent de gradul de avarie.',
    icon: <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
  }];

  return (
    <section className="py-24 px-4 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/30 skew-x-12 translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white uppercase tracking-wide mb-4">
            Serviciile Noastre
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Calitate, siguranță și profesionalism într-un singur loc
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