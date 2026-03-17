import { motion } from 'framer-motion';
export function HeroSection() {
  return (
    <section className="relative w-full bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 px-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-slate-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-slate-950 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
          className="flex flex-col items-start text-left">
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight mb-6 uppercase tracking-wide">
            Găsește Anvelopele <span className="text-amber-500">Perfecte</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-lg">
            Calitate, siguranță și profesionalism într-un singur loc.
            Echipează-ți mașina pentru orice drum.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.button
              whileHover={{
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98
              }}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm">
              
              Caută Anvelope
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98
              }}
              className="px-8 py-4 bg-transparent border-2 border-slate-600 hover:border-white text-white font-bold rounded-md transition-colors uppercase tracking-wider text-sm">
              
              Serviciile Noastre
            </motion.button>
          </div>
        </motion.div>

        {/* Right Content - Abstract Tire Illustration */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: 'easeOut'
          }}
          className="hidden lg:flex justify-center items-center relative">
          
          <div className="relative w-96 h-96">
            {/* Abstract Tire Shape */}
            <div className="absolute inset-0 rounded-full border-[40px] border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-[10px] border-slate-700 bg-slate-900 shadow-xl flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                </div>
              </div>
            </div>
            {/* Decorative accents */}
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-slate-600 opacity-30">
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>);

}