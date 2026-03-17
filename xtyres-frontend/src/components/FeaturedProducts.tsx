import { ArrowRightIcon } from 'lucide-react';
import { Product } from '../lib/products';
import { ProductCard } from './ProductCard';
import { useTranslation } from '../lib/i18n';
import { NavigateFn } from '../lib/navigation';
interface FeaturedProductsProps {
  products: Product[];
  onNavigate: NavigateFn;
}
export function FeaturedProducts({
  products,
  onNavigate
}: FeaturedProductsProps) {
  const { t } = useTranslation();
  const featuredProducts = products.slice(0, 4);
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 uppercase tracking-wide">
              {t('section.top_products')}
            </h2>
            <div className="w-24 h-1 bg-amber-500 mt-4 rounded-full"></div>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="hidden md:flex items-center text-slate-600 hover:text-amber-500 font-semibold transition-colors mt-4 md:mt-0">
            
            Vezi toate produsele <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Updated to grid-cols-2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product, index) =>
          <ProductCard
            key={product.id}
            product={product}
            onNavigate={onNavigate}
            index={index} />

          )}
        </div>

        {featuredProducts.length === 0 ?
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
            Produsele promovate vor apărea aici după ce le adaugi din admin.
          </div> :
        null}

        <div className="mt-8 text-center md:hidden">
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center text-slate-900 hover:text-amber-500 font-bold uppercase tracking-wider transition-colors">
            
            Vezi toate produsele <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>);

}
