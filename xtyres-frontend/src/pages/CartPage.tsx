import {
  ChevronRightIcon,
  TrashIcon,
  ShoppingBagIcon,
  CircleDashedIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../lib/cart';
import { useTranslation } from '../lib/i18n';
import { NavigateFn } from '../lib/navigation';
interface CartPageProps {
  onNavigate: NavigateFn;
}
export function CartPage({ onNavigate }: CartPageProps) {
  const { t } = useTranslation();
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  if (items.length === 0) {
    return (
      <main className="flex-grow bg-slate-50 py-16 flex items-center justify-center">
        <div className="max-w-md w-full px-4 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <ShoppingBagIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-2xl font-heading font-black text-slate-900 uppercase tracking-wide mb-4">
            Coșul tău este gol
          </h1>
          <p className="text-slate-500 mb-8">
            Nu ai adăugat încă niciun produs în coșul de cumpărături.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm">
            
            Continuă cumpărăturile
          </button>
        </div>
      </main>);

  }
  return (
    <main className="flex-grow bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-slate-500 mb-8 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-amber-500 transition-colors">
            
            {t('nav.home')}
          </button>
          <ChevronRightIcon className="w-4 h-4 mx-2" />
          <span className="text-slate-900">Coșul tău</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-wide mb-8">
          Coșul Tău
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-6">Produs</div>
            <div className="col-span-2 text-center">Preț</div>
            <div className="col-span-2 text-center">Cantitate</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Cart Items */}
          <div className="divide-y divide-slate-100">
            {items.map((item) =>
            <div
              key={item.product.id}
              className="p-6 flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center relative">
              
                {/* Mobile Remove Button */}
                <button
                onClick={() => removeFromCart(item.product.id)}
                className="md:hidden absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">
                
                  <TrashIcon className="w-5 h-5" />
                </button>

                <div className="col-span-6 flex items-center mb-4 md:mb-0 pr-8 md:pr-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 mr-4">
                    <CircleDashedIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {item.product.brand}
                    </div>
                    <div className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                      {item.product.name}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex justify-between md:justify-center items-center mb-4 md:mb-0">
                  <span className="md:hidden text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Preț:
                  </span>
                  <span className="font-bold text-slate-900">
                    {item.product.price} MDL
                  </span>
                </div>

                <div className="col-span-2 flex justify-between md:justify-center items-center mb-4 md:mb-0">
                  <span className="md:hidden text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Cantitate:
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-md h-10 w-28">
                    <button
                    onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    
                      -
                    </button>
                    <div className="flex-grow h-full flex items-center justify-center font-bold text-slate-900 border-x border-slate-200 text-sm">
                      {item.quantity}
                    </div>
                    <button
                    onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    
                      +
                    </button>
                  </div>
                </div>

                <div className="col-span-2 flex justify-between md:justify-end items-center">
                  <span className="md:hidden text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Total:
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-heading font-black text-amber-500 mr-4">
                      {item.product.price * item.quantity} MDL
                    </span>
                    <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="hidden md:flex text-slate-300 hover:text-red-500 transition-colors">
                    
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Footer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <button
            onClick={() => onNavigate('products')}
            className="px-8 py-4 border-2 border-slate-200 hover:border-slate-900 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm w-full md:w-auto text-center">
            
            Continuă cumpărăturile
          </button>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 w-full md:w-96">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-slate-900 uppercase tracking-wider">
                Subtotal
              </span>
              <span className="text-2xl font-heading font-black text-slate-900">
                {totalPrice} MDL
              </span>
            </div>
            <motion.button
              whileHover={{
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98
              }}
              onClick={() => onNavigate('checkout')}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm">
              
              Continuă la Checkout
            </motion.button>
          </div>
        </div>
      </div>
    </main>);

}
