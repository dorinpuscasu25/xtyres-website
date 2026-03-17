import {
  ChevronRightIcon,
  AwardIcon,
  UsersIcon,
  ThumbsUpIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { NavigateFn } from '../lib/navigation';
interface AboutPageProps {
  onNavigate: NavigateFn;
}
export function AboutPage({ onNavigate }: AboutPageProps) {
  const { t } = useTranslation();
  return (
    <main className="flex-grow bg-white">
      {/* Hero Banner */}
      <div className="bg-slate-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center text-sm text-slate-400 mb-8 font-medium">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-amber-500 transition-colors">
              
              {t('nav.home')}
            </button>
            <ChevronRightIcon className="w-4 h-4 mx-2" />
            <span className="text-white">{t('page.about.title')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white uppercase tracking-wide mb-6">
            Pasiune pentru <span className="text-amber-500">Siguranță</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            Suntem mai mult decât un magazin de anvelope. Suntem partenerul tău
            de încredere pentru fiecare călătorie.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
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
              duration: 0.6
            }}>
            
            <h2 className="text-3xl font-heading font-bold text-slate-900 uppercase tracking-wide mb-6">
              Povestea Noastră
            </h2>
            <div className="w-20 h-1 bg-amber-500 mb-8 rounded-full"></div>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                XTyres.md a luat naștere din dorința de a oferi șoferilor din
                Moldova acces la anvelope de calitate premium și servicii auto
                la cele mai înalte standarde europene.
              </p>
              <p>
                Cu o locație modernă pe str. Vadul lui Vodă 21/1 în Chișinău, am
                construit un ecosistem complet unde clienții noștri găsesc nu
                doar produse excelente, ci și consultanță de specialitate și
                servicii de vulcanizare profesionale.
              </p>
              <p>
                Echipa noastră este formată din profesioniști pasionați de
                domeniul auto, pregătiți mereu să te ajute să faci cea mai bună
                alegere pentru mașina ta, indiferent de buget sau necesități.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            whileInView={{
              opacity: 1,
              scale: 1
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6,
              delay: 0.2
            }}
            className="relative">
            
            <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-xl flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-50"></div>
              <div className="w-48 h-48 rounded-full border-[16px] border-slate-300 bg-slate-400 relative z-10 shadow-lg"></div>
              <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-lg z-20">
                <div className="text-amber-500 font-bold text-xl">
                  XTyres.md
                </div>
                <div className="text-slate-500 text-sm">Premium Service</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-50 py-20 px-4 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-heading font-black text-amber-500 mb-2">
                10+
              </div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Ani Experiență
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-heading font-black text-amber-500 mb-2">
                1800+
              </div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Produse în Stoc
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-heading font-black text-amber-500 mb-2">
                5000+
              </div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Clienți Mulțumiți
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-heading font-black text-amber-500 mb-2">
                3
              </div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Servicii Premium
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-slate-900 uppercase tracking-wide mb-4">
            Valorile Noastre
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow text-center group">
            <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
              <AwardIcon className="w-10 h-10 text-amber-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Calitate
            </h3>
            <p className="text-slate-600">
              Colaborăm doar cu branduri recunoscute internațional pentru a
              garanta calitatea și durabilitatea fiecărui produs vândut.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow text-center group">
            <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
              <UsersIcon className="w-10 h-10 text-amber-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Profesionalism
            </h3>
            <p className="text-slate-600">
              Echipa noastră este instruită constant pentru a oferi cele mai
              bune sfaturi și servicii tehnice impecabile.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow text-center group">
            <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
              <ThumbsUpIcon className="w-10 h-10 text-amber-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Încredere
            </h3>
            <p className="text-slate-600">
              Construim relații pe termen lung cu clienții noștri prin
              transparență, prețuri corecte și garanții respectate.
            </p>
          </div>
        </div>
      </div>
    </main>);

}
