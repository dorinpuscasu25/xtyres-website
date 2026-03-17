import { MouseEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, CheckIcon } from 'lucide-react';
import { Product } from '../lib/products';
import { useTranslation } from '../lib/i18n';
import { useCart } from '../lib/cart';
import { NavigateFn } from '../lib/navigation';
interface ProductCardProps {
  product: Product;
  onNavigate: NavigateFn;
  index?: number;
}
export function ProductCard({
  product,
  onNavigate,
  index = 0
}: ProductCardProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const handleAddToCart = (e: MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case 'Nou':
        return 'bg-green-500 text-white';
      case 'Super Preț':
        return 'bg-red-500 text-white';
      case 'Montare gratuită':
        return 'bg-slate-900 text-white';
      case 'Reducere':
        return 'bg-amber-500 text-slate-900';
      default:
        return 'bg-slate-900 text-white';
    }
  };
  const getBadgeTranslation = (badge: string | null) => {
    if (!badge) return null;
    switch (badge) {
      case 'Nou':
        return t('badge.new');
      case 'Super Preț':
        return t('badge.super_price');
      case 'Montare gratuită':
        return t('badge.free_mounting');
      case 'Reducere':
        return t('badge.discount');
      default:
        return badge;
    }
  };
  return (
    <motion.div
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
      className="bg-white border border-slate-100 rounded-xl p-3 sm:p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col relative group cursor-pointer"
      onClick={() =>
        onNavigate('product-detail', {
          productId: product.id,
          productSlug: product.slug
        })
      }>
      
      {product.badge &&
      <div
        className={`absolute top-2 left-2 sm:top-4 sm:left-4 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full z-10 ${getBadgeColor(product.badge)}`}>
        
          {getBadgeTranslation(product.badge)}
        </div>
      }

      <div className="w-full aspect-square bg-slate-50 rounded-lg mb-4 sm:mb-6 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl ?
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" /> :
        <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-[8px] sm:border-[12px] border-slate-200 bg-slate-300 group-hover:scale-105 transition-transform duration-500"></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
      </div>

      <div className="flex-grow flex flex-col">
        <div className="text-[10px] sm:text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">
          {product.brand}
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-amber-500 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-2 sm:pt-4">
          <div className="flex flex-col mb-3 sm:mb-4">
            {product.oldPrice &&
            <span className="text-[10px] sm:text-sm text-slate-400 line-through font-medium">
                {product.oldPrice} MDL
              </span>
            }
            <span className="text-base sm:text-xl font-heading font-extrabold text-amber-500">
              {product.price} MDL
            </span>
          </div>

          <motion.button
            whileHover={{
              scale: 1.02
            }}
            whileTap={{
              scale: 0.98
            }}
            onClick={handleAddToCart}
            className={`w-full py-2 sm:py-3 font-bold rounded-md transition-colors uppercase tracking-wider text-[10px] sm:text-xs flex items-center justify-center ${added ? 'bg-green-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
            
            {added ?
            <>
                <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />{' '}
                Adăugat
              </> :

            <>
                <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />{' '}
                {t('btn.add_to_cart')}
              </>
            }
          </motion.button>
        </div>
      </div>
    </motion.div>);

}
