import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { storefrontApi } from '../lib/api';
import { useTranslation } from '../lib/i18n';
import { CatalogAttributeFilter, CatalogRequestFilter, StoreCategory } from '../lib/products';
import { NavigateFn } from '../lib/navigation';
import { useStorefront } from '../lib/storefront';

interface TireSearchFormProps {
  onNavigate: NavigateFn;
}

function flattenCategories(categories: StoreCategory[]): StoreCategory[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children)]);
}

function findAttribute(
  attributes: CatalogAttributeFilter[],
  slugs: string[],
): CatalogAttributeFilter | undefined {
  return attributes.find((attribute) => slugs.includes(attribute.slug));
}

export function TireSearchForm({ onNavigate }: TireSearchFormProps) {
  const { locale } = useTranslation();
  const { bootstrap } = useStorefront();
  const [searchFilters, setSearchFilters] = useState<CatalogAttributeFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [diameter, setDiameter] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [season, setSeason] = useState('');

  const tireCategory = useMemo(() => {
    const allCategories = flattenCategories(bootstrap?.menu || []);
    return allCategories.find((category) =>
    ['anvelope', 'shiny'].includes(category.slug) ||
    ['Anvelope', 'Шины'].includes(category.name)
    );
  }, [bootstrap]);

  const diameterFilter = useMemo(
    () => findAttribute(searchFilters, ['diametru', 'diametr']),
    [searchFilters]
  );
  const widthFilter = useMemo(
    () => findAttribute(searchFilters, ['latime', 'shirina']),
    [searchFilters]
  );
  const heightFilter = useMemo(
    () => findAttribute(searchFilters, ['inaltime', 'vysota']),
    [searchFilters]
  );
  const seasonFilter = useMemo(
    () => findAttribute(searchFilters, ['sezon']),
    [searchFilters]
  );

  useEffect(() => {
    if (!tireCategory?.slug) return;

    setIsLoading(true);
    storefrontApi.catalog({
      locale,
      category: tireCategory.slug,
      page: 1
    }).
    then((response) => {
      setSearchFilters(response.filters.attributes);
    }).
    catch((error) => {
      console.error('Failed to load tire search filters', error);
      setSearchFilters([]);
    }).
    finally(() => setIsLoading(false));
  }, [locale, tireCategory?.slug]);

  const submit = () => {
    const filters: CatalogRequestFilter[] = [];

    if (diameterFilter && diameter) {
      filters.push({
        attribute_id: diameterFilter.id,
        type: 'select',
        values: [Number(diameter)]
      });
    }

    if (seasonFilter && season) {
      filters.push({
        attribute_id: seasonFilter.id,
        type: 'select',
        values: [Number(season)]
      });
    }

    if (widthFilter && width) {
      filters.push({
        attribute_id: widthFilter.id,
        type: 'number',
        min: Number(width),
        max: Number(width)
      });
    }

    if (heightFilter && height) {
      filters.push({
        attribute_id: heightFilter.id,
        type: 'number',
        min: Number(height),
        max: Number(height)
      });
    }

    onNavigate('products', {
      categorySlug: tireCategory?.slug,
      filters
    });
  };

  return (
    <section className="w-full px-4 relative z-20 -mt-16 mb-20">
      <div className="max-w-5xl mx-auto">
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
            duration: 0.5
          }}
          className="bg-white rounded-xl shadow-2xl p-6 md:p-8 border border-slate-100">
          
          <h2 className="text-xl font-heading font-bold text-slate-900 mb-6 uppercase tracking-wide flex items-center">
            <span className="w-2 h-6 bg-amber-500 mr-3 rounded-sm"></span>
            Căutare Rapidă
          </h2>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-grow w-full">
              {/* Step 1 */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-2 text-[10px]">
                    1
                  </span>
                  Diametru
                </label>
                <div className="relative">
                  <select
                    value={diameter}
                    onChange={(event) => setDiameter(event.target.value)}
                    disabled={isLoading || !diameterFilter}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">Alege diametru</option>
                    {(diameterFilter?.options || []).map((option) =>
                    <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    )}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-2 text-[10px]">
                    2
                  </span>
                  Lățime
                </label>
                <div className="relative">
                  <select
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    disabled={isLoading || !widthFilter}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">Alege lățime</option>
                    {(widthFilter?.values || []).map((value) =>
                    <option key={value} value={value}>
                        {value}
                      </option>
                    )}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-2 text-[10px]">
                    3
                  </span>
                  Înălțime
                </label>
                <div className="relative">
                  <select
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    disabled={isLoading || !heightFilter}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">Alege înălțime</option>
                    {(heightFilter?.values || []).map((value) =>
                    <option key={value} value={value}>
                        {value}
                      </option>
                    )}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-2 text-[10px]">
                    4
                  </span>
                  Sezon
                </label>
                <div className="relative">
                  <select
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                    disabled={isLoading || !seasonFilter}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">Alege sezon</option>
                    {(seasonFilter?.options || []).map((option) =>
                    <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    )}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98
              }}
              onClick={submit}
              className="w-full md:w-auto px-8 py-3 h-[50px] bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-md transition-colors uppercase tracking-wider text-sm whitespace-nowrap">
              
              {isLoading ? 'Se încarcă...' : 'Căutare'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>);

}
