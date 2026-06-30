import {
  ArrowRightIcon,
  SunIcon,
  SnowflakeIcon,
  BatteryIcon } from
'lucide-react';
import { StoreCategory } from '../lib/products';
import { NavigateFn } from '../lib/navigation';
import { useTranslation } from '../lib/i18n';
interface CategoryCardsProps {
  categories: StoreCategory[];
  onNavigate: NavigateFn;
}
export function CategoryCards({
  categories,
  onNavigate
}: CategoryCardsProps) {
  const { t } = useTranslation();
  const mappedCategories = categories.slice(0, 3).map((category, index) => ({
    ...category,
    icon: index === 0 ?
    <SunIcon className="w-12 h-12 text-amber-500 mb-4" /> :
    index === 1 ?
    <SnowflakeIcon className="w-12 h-12 text-amber-500 mb-4" /> :
    <BatteryIcon className="w-12 h-12 text-amber-500 mb-4" />,
    bgClass: index === 0 ?
    'bg-gradient-to-br from-slate-800 to-slate-900' :
    index === 1 ?
    'bg-gradient-to-br from-slate-700 to-slate-800' :
    'bg-gradient-to-br from-slate-900 to-slate-950'
  }));

  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 uppercase tracking-wide">
            {t('section.categories')}
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {mappedCategories.map((cat, index) =>
          <a
            key={index}
            href="#catalog"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('products', {
                categorySlug: cat.slug
              });
            }}
            className={`group relative overflow-hidden rounded-xl h-80 flex flex-col items-center justify-center p-8 text-center ${cat.bgClass} shadow-lg`}>
            
              {/* Decorative background circle */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out"></div>

              <div className="relative z-10 flex flex-col items-center transform group-hover:-translate-y-2 transition-transform duration-300">
                {cat.icon}
                <h3 className="text-2xl font-heading font-bold text-white mb-4 uppercase tracking-wider">
                  {cat.name}
                </h3>
                <div className="flex items-center text-amber-500 font-semibold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t('btn.view_products')} <ArrowRightIcon className="w-4 h-4 ml-2" />
                </div>
              </div>
            </a>
          )}
        </div>

        {mappedCategories.length === 0 ?
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            {t('section.categories_empty')}
          </div> :
        null}
      </div>
    </section>);

}
