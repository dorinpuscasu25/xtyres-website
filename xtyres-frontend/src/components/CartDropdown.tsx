import { ShoppingBagIcon, XIcon, CircleDashedIcon } from 'lucide-react';
import { useCart } from '../lib/cart';
import { NavigateFn } from '../lib/navigation';
interface CartDropdownProps {
  onNavigate: NavigateFn;
}
export function CartDropdown({ onNavigate }: CartDropdownProps) {
  const { items, removeFromCart, totalPrice } = useCart();
  if (items.length === 0) {
    return (
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-8 z-50 flex flex-col items-center justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingBagIcon className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium text-center mb-6">
          Coșul tău este gol
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('products');
          }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-xs">
          
          Continuă cumpărăturile
        </button>
      </div>);

  }
  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <span className="font-heading font-bold text-slate-900 uppercase tracking-wider text-sm">
          Coșul tău
        </span>
        <span className="text-xs font-bold text-slate-500">
          {items.length} produse
        </span>
      </div>

      <div className="overflow-y-auto flex-grow max-h-64 p-2">
        {items.slice(0, 3).map((item) =>
        <div
          key={item.product.id}
          className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors group/item">
          
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0 border border-slate-200">
              <CircleDashedIcon className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-grow min-w-0 pr-2">
              <div className="text-xs font-bold text-slate-900 truncate mb-1">
                {item.product.name}
              </div>
              <div className="text-xs text-slate-500">
                {item.quantity} ×{' '}
                <span className="font-bold text-amber-500">
                  {item.product.price} MDL
                </span>
              </div>
            </div>
            <button
            onClick={(e) => {
              e.stopPropagation();
              removeFromCart(item.product.id);
            }}
            className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-colors opacity-0 group-hover/item:opacity-100">
            
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        {items.length > 3 &&
        <div className="text-center py-2 text-xs font-bold text-slate-400">
            + încă {items.length - 3} produse
          </div>
        }
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Total:
          </span>
          <span className="text-xl font-heading font-black text-slate-900">
            {totalPrice} MDL
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('cart');
            }}
            className="py-3 border-2 border-slate-200 hover:border-slate-900 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-xs text-center">
            
            Vezi Coșul
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('checkout');
            }}
            className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-xs text-center">
            
            Checkout
          </button>
        </div>
      </div>
    </div>);

}
