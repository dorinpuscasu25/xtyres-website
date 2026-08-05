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

function normalizeAttributeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function findAttribute(
  attributes: CatalogAttributeFilter[],
  candidates: string[],
): CatalogAttributeFilter | undefined {
  const normalizedCandidates = candidates.map(normalizeAttributeText);

  return attributes.find((attribute) => {
    const searchableValues = [attribute.slug, attribute.label]
      .filter(Boolean)
      .map(normalizeAttributeText);

    return searchableValues.some((searchableValue) =>
      normalizedCandidates.some((candidate) =>
        searchableValue === candidate || searchableValue.includes(candidate)
      )
    );
  });
}

function getFilterOptions(filter?: CatalogAttributeFilter) {
  if (!filter) return [];

  if (filter.options && filter.options.length > 0) {
    return filter.options.map((option) => ({
      value: String(option.id),
      label: option.label,
    }));
  }

  return (filter.values || []).map((value) => ({
    value: String(value),
    label: String(value),
  }));
}

function addQuickFilter(
  filters: CatalogRequestFilter[],
  filter: CatalogAttributeFilter | undefined,
  selectedValue: string,
) {
  if (!filter || !selectedValue) return;

  if (filter.type === 'select' || filter.type === 'multi_select') {
    filters.push({
      attribute_id: filter.id,
      type: filter.type,
      values: [Number(selectedValue)]
    });

    return;
  }

  if (filter.type === 'boolean') {
    filters.push({
      attribute_id: filter.id,
      type: 'boolean',
      value: selectedValue === '1'
    });

    return;
  }

  filters.push({
    attribute_id: filter.id,
    type: 'number',
    min: Number(selectedValue),
    max: Number(selectedValue)
  });
}

export function TireSearchForm({ onNavigate }: TireSearchFormProps) {
  const { t, locale } = useTranslation();
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
    () => findAttribute(searchFilters, ['diametru', 'diametr', 'diameter', 'диаметр']),
    [searchFilters]
  );
  const widthFilter = useMemo(
    () => findAttribute(searchFilters, ['latime', 'latime-mm', 'latimemm', 'width', 'shirina', 'ширина']),
    [searchFilters]
  );
  const heightFilter = useMemo(
    () => findAttribute(searchFilters, ['inaltime', 'inaltime-%', 'inaltimeprocent', 'height', 'vysota', 'высота']),
    [searchFilters]
  );
  const seasonFilter = useMemo(
    () => findAttribute(searchFilters, ['sezon', 'season', 'sezonul', 'сезон']),
    [searchFilters]
  );

  const diameterOptions = useMemo(() => getFilterOptions(diameterFilter), [diameterFilter]);
  const widthOptions = useMemo(() => getFilterOptions(widthFilter), [widthFilter]);
  const heightOptions = useMemo(() => getFilterOptions(heightFilter), [heightFilter]);
  const seasonOptions = useMemo(() => getFilterOptions(seasonFilter), [seasonFilter]);

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

    addQuickFilter(filters, diameterFilter, diameter);
    addQuickFilter(filters, widthFilter, width);
    addQuickFilter(filters, heightFilter, height);
    addQuickFilter(filters, seasonFilter, season);

    onNavigate('products', {
      categorySlug: tireCategory?.slug,
      filters
    });
  };

  return (
    <section className="w-full px-4 py-12 md:py-16 bg-slate-900 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border-[48px] border-white/[0.03] pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full border-[56px] border-amber-500/[0.04] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-black text-white uppercase tracking-wide">
            {t('quick_search.title')}
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-2xl shadow-xl shadow-black/20 p-5 sm:p-6 md:p-8 border border-white/10">
          <div className="flex flex-col lg:flex-row gap-5 items-end">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow w-full">
              {/* Step 1 */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-2 text-[10px]">
                    1
                  </span>
                  {t('quick_search.diameter')}
                </label>
                <div className="relative">
                  <select
                    value={diameter}
                    onChange={(event) => setDiameter(event.target.value)}
                    disabled={isLoading || !diameterFilter}
                    className="w-full h-[52px] appearance-none bg-slate-50 border border-slate-200 text-slate-900 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium transition-shadow disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">{t('quick_search.choose_diameter')}</option>
                    {diameterOptions.map((option) =>
                    <option key={option.value} value={option.value}>
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
                  {t('quick_search.width')}
                </label>
                <div className="relative">
                  <select
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    disabled={isLoading || !widthFilter}
                    className="w-full h-[52px] appearance-none bg-slate-50 border border-slate-200 text-slate-900 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium transition-shadow disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">{t('quick_search.choose_width')}</option>
                    {widthOptions.map((option) =>
                    <option key={option.value} value={option.value}>
                        {option.label}
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
                  {t('quick_search.height')}
                </label>
                <div className="relative">
                  <select
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    disabled={isLoading || !heightFilter}
                    className="w-full h-[52px] appearance-none bg-slate-50 border border-slate-200 text-slate-900 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium transition-shadow disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">{t('quick_search.choose_height')}</option>
                    {heightOptions.map((option) =>
                    <option key={option.value} value={option.value}>
                        {option.label}
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
                  {t('quick_search.season')}
                </label>
                <div className="relative">
                  <select
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                    disabled={isLoading || !seasonFilter}
                    className="w-full h-[52px] appearance-none bg-slate-50 border border-slate-200 text-slate-900 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer font-medium transition-shadow disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">{t('quick_search.choose_season')}</option>
                    {seasonOptions.map((option) =>
                    <option key={option.value} value={option.value}>
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
              className="w-full lg:w-auto px-10 h-[52px] bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors uppercase tracking-wider text-sm whitespace-nowrap shadow-md shadow-amber-500/20">
              
              {isLoading ? t('btn.loading') : t('btn.search')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>);

}
