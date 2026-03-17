import { ReactNode, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { CatalogFilters } from '../lib/products';
import { useTranslation } from '../lib/i18n';
interface FilterSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}
function FilterSection({
  title,
  children,
  defaultOpen = true
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 py-4 last:border-0">
      <button
        className="flex items-center justify-between w-full text-left font-bold text-slate-900 uppercase tracking-wider text-sm mb-2"
        onClick={() => setIsOpen(!isOpen)}>
        
        {title}
        {isOpen ?
        <ChevronUpIcon className="w-4 h-4 text-slate-400" /> :

        <ChevronDownIcon className="w-4 h-4 text-slate-400" />
        }
      </button>
      {isOpen && <div className="mt-3 space-y-3">{children}</div>}
    </div>);

}
interface ProductFiltersProps {
  filters?: CatalogFilters;
  selectedBrandIds: number[];
  onToggleBrand: (brandId: number) => void;
  priceRange: {min: string; max: string;};
  onPriceChange: (field: 'min' | 'max', value: string) => void;
  selectedAttributeFilters: Record<number, any>;
  onToggleAttributeOption: (
  attributeId: number,
  optionId: number,
  type: 'select' | 'multi_select' | 'boolean',
  value?: boolean) => void;
  onAttributeRangeChange: (
  attributeId: number,
  field: 'min' | 'max',
  value: string) => void;
  onReset: () => void;
}
export function ProductFilters({
  filters,
  selectedBrandIds,
  onToggleBrand,
  priceRange,
  onPriceChange,
  selectedAttributeFilters,
  onToggleAttributeOption,
  onAttributeRangeChange,
  onReset
}: ProductFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <h3 className="font-heading font-bold text-lg text-slate-900 uppercase tracking-wide">
          {t('page.products.filters')}
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-bold text-amber-500 hover:text-amber-600 uppercase tracking-wider">
          
          {t('btn.reset_filters')}
        </button>
      </div>

      <FilterSection title={t('filter.brand')}>
        {(filters?.brands || []).map((brand) =>
        <label
          key={brand.id}
          className="flex items-center justify-between space-x-3 cursor-pointer group">
          
            <div className="flex items-center space-x-3">
              <input
              type="checkbox"
              checked={selectedBrandIds.includes(brand.id)}
              onChange={() => onToggleBrand(brand.id)}
              className="form-checkbox h-4 w-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500" />
            
              <span className="text-sm text-slate-600 group-hover:text-slate-900">
                {brand.label}
              </span>
            </div>
            <span className="text-xs text-slate-400">{brand.count}</span>
          </label>
        )}
      </FilterSection>

      <FilterSection title={t('filter.price')}>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={priceRange.min}
            min={filters?.price.min || 0}
            placeholder={String(filters?.price.min || 0)}
            onChange={(e) => onPriceChange('min', e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          
          <input
            type="number"
            value={priceRange.max}
            min={filters?.price.min || 0}
            placeholder={String(filters?.price.max || 0)}
            onChange={(e) => onPriceChange('max', e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          
        </div>
      </FilterSection>

      {(filters?.attributes || []).map((attribute) =>
      <FilterSection key={attribute.id} title={attribute.label}>
          {attribute.type === 'number' &&
        <div className="grid grid-cols-2 gap-3">
              <input
            type="number"
            value={selectedAttributeFilters[attribute.id]?.min || ''}
            placeholder={String(attribute.min || '')}
            onChange={(e) =>
            onAttributeRangeChange(attribute.id, 'min', e.target.value)
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          
              <input
            type="number"
            value={selectedAttributeFilters[attribute.id]?.max || ''}
            placeholder={String(attribute.max || '')}
            onChange={(e) =>
            onAttributeRangeChange(attribute.id, 'max', e.target.value)
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          
            </div>
        }

          {(attribute.type === 'select' ||
        attribute.type === 'multi_select' ||
        attribute.type === 'boolean') &&
        <div className="space-y-2">
              {(attribute.options || []).map((option) =>
          <label
            key={option.id}
            className="flex items-center justify-between space-x-3 cursor-pointer group">
            
                  <div className="flex items-center space-x-3">
                    <input
                type="checkbox"
                checked={
                selectedAttributeFilters[attribute.id]?.values?.includes(
                  option.id)
                }
                onChange={() => {
                  if (attribute.type === 'select' || attribute.type === 'multi_select' || attribute.type === 'boolean') {
                    onToggleAttributeOption(
                      attribute.id,
                      option.id,
                      attribute.type,
                      option.value,
                    );
                  }
                }}
                className="form-checkbox h-4 w-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500" />
              
                    <span className="text-sm text-slate-600 group-hover:text-slate-900">
                      {option.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{option.count}</span>
                </label>
          )}
            </div>
        }
        </FilterSection>
      )}
    </div>);

}
