import { useEffect, useRef, useState } from 'react';
import { SearchIcon, XIcon, CircleDashedIcon } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { storefrontApi } from '../lib/api';
import { Product } from '../lib/products';
import { NavigateFn } from '../lib/navigation';
interface SearchBarProps {
  onNavigate: NavigateFn;
}
export function SearchBar({ onNavigate }: SearchBarProps) {
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (query.trim().length > 1) {
      const timeout = window.setTimeout(() => {
        storefrontApi.search(query, locale).then((response) => {
          setResults(response.products);
        }).catch((error) => {
          console.error('Search failed', error);
          setResults([]);
        });
      }, 250);

      return () => window.clearTimeout(timeout);
    } else {
      setResults([]);
    }
  }, [query, locale]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node))
      {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div
        className={`relative flex items-center w-full h-10 rounded-full border transition-all duration-300 ${isFocused ? 'border-amber-500 ring-2 ring-amber-500/20 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
        
        <div className="pl-3 pr-2 text-slate-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          className="w-full h-full bg-transparent border-none focus:outline-none text-sm text-slate-900 placeholder-slate-400"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)} />
        
        {query &&
        <button
          onClick={() => setQuery('')}
          className="pr-3 pl-2 text-slate-400 hover:text-slate-600">
          
            <XIcon className="w-4 h-4" />
          </button>
        }
      </div>

      {isFocused && query.trim().length > 1 &&
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
          {results.length > 0 ?
        <div className="py-2">
              {results.map((product) =>
          <button
            key={product.id}
            onClick={() => {
              setQuery('');
              setIsFocused(false);
              onNavigate('product-detail', {
                productId: product.id,
                productSlug: product.slug
              });
            }}
            className="w-full flex items-center px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0">
            
                  {product.imageUrl ?
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0" /> :
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <CircleDashedIcon className="w-5 h-5 text-slate-400" />
                    </div>
                }
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {product.brand}
                    </div>
                  </div>
                  <div className="ml-3 text-sm font-bold text-amber-500 whitespace-nowrap">
                    {product.price} MDL
                  </div>
                </button>
          )}
              <button
            onClick={() => {
              setIsFocused(false);
              onNavigate('products', {
                query
              });
            }}
            className="w-full text-center py-3 text-sm font-bold text-slate-600 hover:text-amber-500 transition-colors bg-slate-50 mt-1">
            
                {t('search.all_results')}
              </button>
            </div> :

        <div className="p-4 text-center text-sm text-slate-500">
              Nu am găsit rezultate pentru "{query}"
            </div>
        }
        </div>
      }
    </div>);

}
