import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRightIcon,
  SlidersHorizontalIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { ProductFilters } from '../components/ProductFilters';
import { ProductCard } from '../components/ProductCard';
import { storefrontApi } from '../lib/api';
import { useTranslation } from '../lib/i18n';
import {
  CatalogFilters,
  CatalogPagination,
  CatalogRequestFilter,
  Product,
} from '../lib/products';
import { NavigateFn } from '../lib/navigation';
import { updateBrowserUrl } from '../lib/router';

type SelectedAttributeFilter = {
  type: CatalogRequestFilter['type'];
  values?: number[];
  min?: string;
  max?: string;
  value?: boolean;
};

interface ProductsPageProps {
  onNavigate: NavigateFn;
  initialCategorySlug?: string;
  initialQuery?: string;
  initialFilters?: CatalogRequestFilter[];
  initialSort?: string;
  initialPage?: number;
  initialBrandIds?: number[];
  initialPriceMin?: number | null;
  initialPriceMax?: number | null;
}

function serializeAttributeFilters(
  selectedFilters: Record<number, SelectedAttributeFilter>,
): CatalogRequestFilter[] {
  return Object.entries(selectedFilters)
    .map(([attributeId, value]) => ({
      attribute_id: Number(attributeId),
      type: value.type,
      values: value.values,
      min: value.min !== undefined && value.min !== '' ? Number(value.min) : undefined,
      max: value.max !== undefined && value.max !== '' ? Number(value.max) : undefined,
      value: value.value,
    }))
    .filter(
      (item) =>
        (item.values && item.values.length > 0) ||
        item.min !== undefined ||
        item.max !== undefined ||
        item.value !== undefined,
    );
}

export function ProductsPage({
  onNavigate,
  initialCategorySlug,
  initialQuery,
  initialFilters = [],
  initialSort = 'featured',
  initialPage = 1,
  initialBrandIds = [],
  initialPriceMin = null,
  initialPriceMax = null,
}: ProductsPageProps) {
  const { t, locale } = useTranslation();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<CatalogFilters | undefined>(undefined);
  const [pagination, setPagination] = useState<CatalogPagination>({
    currentPage: initialPage,
    lastPage: 1,
    perPage: 12,
    total: 0,
  });
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>(initialBrandIds);
  const [selectedAttributeFilters, setSelectedAttributeFilters] = useState<
    Record<number, SelectedAttributeFilter>
  >({});
  const [priceRange, setPriceRange] = useState({
    min: initialPriceMin !== null ? String(initialPriceMin) : '',
    max: initialPriceMax !== null ? String(initialPriceMax) : '',
  });
  const [sort, setSort] = useState(initialSort);
  const [isLoading, setIsLoading] = useState(false);

  const initialFiltersKey = JSON.stringify(initialFilters);
  const initialBrandIdsKey = initialBrandIds.join(',');

  useEffect(() => {
    setSelectedBrandIds(initialBrandIds);
    setSelectedAttributeFilters(
      initialFilters.reduce<Record<number, SelectedAttributeFilter>>((accumulator, filter) => {
        accumulator[filter.attribute_id] = {
          type: filter.type,
          values: filter.values || [],
          min:
            filter.min !== undefined && filter.min !== null ? String(filter.min) : '',
          max:
            filter.max !== undefined && filter.max !== null ? String(filter.max) : '',
          value: filter.value,
        };

        return accumulator;
      }, {}),
    );
    setPriceRange({
      min: initialPriceMin !== null ? String(initialPriceMin) : '',
      max: initialPriceMax !== null ? String(initialPriceMax) : '',
    });
    setSort(initialSort);
    setPagination((current) => ({
      ...current,
      currentPage: initialPage,
    }));
  }, [
    initialCategorySlug,
    initialQuery,
    initialFiltersKey,
    initialSort,
    initialPage,
    initialBrandIdsKey,
    initialPriceMin,
    initialPriceMax,
  ]);

  const activeAttributeFilters = useMemo(
    () => serializeAttributeFilters(selectedAttributeFilters),
    [selectedAttributeFilters],
  );
  const activeAttributeFiltersKey = JSON.stringify(activeAttributeFilters);

  useEffect(() => {
    updateBrowserUrl(
      {
        page: 'products',
        categorySlug: initialCategorySlug,
        query: initialQuery,
        filters: activeAttributeFilters,
        sort,
        pageNumber: pagination.currentPage,
        brandIds: selectedBrandIds,
        priceMin: priceRange.min !== '' ? Number(priceRange.min) : null,
        priceMax: priceRange.max !== '' ? Number(priceRange.max) : null,
      },
      true,
    );
  }, [
    initialCategorySlug,
    initialQuery,
    activeAttributeFiltersKey,
    sort,
    pagination.currentPage,
    selectedBrandIds,
    priceRange.min,
    priceRange.max,
  ]);

  useEffect(() => {
    setIsLoading(true);
    storefrontApi
      .catalog({
        locale,
        category: initialCategorySlug,
        q: initialQuery,
        sort,
        page: pagination.currentPage,
        brandIds: selectedBrandIds,
        priceMin: priceRange.min ? Number(priceRange.min) : null,
        priceMax: priceRange.max ? Number(priceRange.max) : null,
        filters: activeAttributeFilters,
      })
      .then((response) => {
        setProducts(response.products);
        setFilters(response.filters);
        setPagination(response.pagination);
      })
      .catch((error) => {
        console.error('Failed to load catalog', error);
        setProducts([]);
        setFilters(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [
    locale,
    initialCategorySlug,
    initialQuery,
    sort,
    pagination.currentPage,
    selectedBrandIds,
    priceRange.min,
    priceRange.max,
    activeAttributeFiltersKey,
  ]);

  const toggleBrand = (brandId: number) => {
    setPagination((current) => ({
      ...current,
      currentPage: 1,
    }));
    setSelectedBrandIds((current) =>
      current.includes(brandId)
        ? current.filter((id) => id !== brandId)
        : [...current, brandId],
    );
  };

  const toggleAttributeOption = (
    attributeId: number,
    optionId: number,
    type: 'select' | 'multi_select' | 'boolean',
    value?: boolean,
  ) => {
    setPagination((current) => ({
      ...current,
      currentPage: 1,
    }));
    setSelectedAttributeFilters((current) => {
      const existing = current[attributeId] || {
        type,
        values: [],
      };
      const values = existing.values || [];

      if (type === 'select') {
        return {
          ...current,
          [attributeId]: {
            type,
            values: values.includes(optionId) ? [] : [optionId],
          },
        };
      }

      if (type === 'boolean') {
        return {
          ...current,
          [attributeId]: {
            type,
            values: values.includes(optionId) ? [] : [optionId],
            value,
          },
        };
      }

      return {
        ...current,
        [attributeId]: {
          type,
          values: values.includes(optionId)
            ? values.filter((id: number) => id !== optionId)
            : [...values, optionId],
        },
      };
    });
  };

  const onAttributeRangeChange = (
    attributeId: number,
    field: 'min' | 'max',
    value: string,
  ) => {
    setPagination((current) => ({
      ...current,
      currentPage: 1,
    }));
    setSelectedAttributeFilters((current) => ({
      ...current,
      [attributeId]: {
        ...(current[attributeId] || {
          type: 'number',
        }),
        [field]: value,
      },
    }));
  };

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    setPagination((current) => ({
      ...current,
      currentPage: 1,
    }));
    setPriceRange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setSelectedBrandIds([]);
    setSelectedAttributeFilters({});
    setPriceRange({
      min: '',
      max: '',
    });
    setPagination((current) => ({
      ...current,
      currentPage: 1,
    }));
  };

  return (
    <main className="flex-grow bg-slate-50 py-8" id="catalog">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-slate-500 mb-8 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-amber-500 transition-colors"
          >
            {t('nav.home')}
          </button>
          <ChevronRightIcon className="w-4 h-4 mx-2" />
          <span className="text-slate-900">{t('page.products.title')}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-wide mb-2">
              {t('page.products.title')}
            </h1>
            <p className="text-slate-500 font-medium">
              {t('page.products.showing', {
                count: pagination.total,
              })}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="md:hidden flex items-center px-4 py-2 bg-white border border-slate-200 rounded-md font-bold text-slate-700 text-sm uppercase tracking-wider"
            >
              <SlidersHorizontalIcon className="w-4 h-4 mr-2" />
              {t('page.products.filters')}
            </button>

            <div className="relative flex items-center bg-white border border-slate-200 rounded-md px-4 py-2">
              <span className="text-sm text-slate-500 mr-2 hidden sm:inline">
                {t('page.products.sort')}:
              </span>
              <select
                value={sort}
                onChange={(event) => {
                  setPagination((current) => ({
                    ...current,
                    currentPage: 1,
                  }));
                  setSort(event.target.value);
                }}
                className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none appearance-none pr-6 cursor-pointer"
              >
                <option value="featured">Recomandate</option>
                <option value="price_asc">Preț: mic la mare</option>
                <option value="price_desc">Preț: mare la mic</option>
                <option value="newest">Cele mai noi</option>
                <option value="name_asc">Nume A-Z</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div
            className={`w-full md:w-64 lg:w-72 flex-shrink-0 ${
              isMobileFiltersOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <ProductFilters
              filters={filters}
              selectedBrandIds={selectedBrandIds}
              onToggleBrand={toggleBrand}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              selectedAttributeFilters={selectedAttributeFilters}
              onToggleAttributeOption={toggleAttributeOption}
              onAttributeRangeChange={onAttributeRangeChange}
              onReset={resetFilters}
            />
          </div>

          <div className="flex-grow">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
                Se încarcă produsele...
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onNavigate={onNavigate}
                      index={index}
                    />
                  ))}
                </div>

                <div className="mt-12 flex items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        currentPage: Math.max(1, current.currentPage - 1),
                      }))
                    }
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 rounded-md border border-slate-200 bg-white disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  <span className="text-sm font-semibold text-slate-700">
                    Pagina {pagination.currentPage} din {pagination.lastPage}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        currentPage: Math.min(current.lastPage, current.currentPage + 1),
                      }))
                    }
                    disabled={pagination.currentPage === pagination.lastPage}
                    className="px-4 py-2 rounded-md border border-slate-200 bg-white disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
                Nu am găsit produse pentru filtrele selectate.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
