import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type TranslationFieldsProps = {
    fieldName: string;
    label: string;
    value: Record<string, string>;
    onChange: (locale: string, nextValue: string) => void;
    errors?: Record<string, string>;
    type?: 'input' | 'textarea';
    placeholder?: string;
    activeLocale?: 'ro' | 'ru';
};

const locales = ['ro', 'ru'];
const localeLabels: Record<string, string> = {
    ro: 'Română',
    ru: 'Русский',
};

export function TranslationFields({
    fieldName,
    label,
    value,
    onChange,
    errors = {},
    type = 'input',
    placeholder,
    activeLocale,
}: TranslationFieldsProps) {
    const visibleLocales = activeLocale ? [activeLocale] : locales;

    return (
        <div className={`grid gap-4 ${visibleLocales.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {visibleLocales.map((locale) => {
                const fieldKey = `${fieldName}.${locale}`;
                const error = errors[fieldKey];
                const hiddenLocaleErrors = locales
                    .filter((item) => !visibleLocales.includes(item))
                    .filter((item) => errors[`${fieldName}.${item}`]);

                return (
                    <div key={locale} className="space-y-2">
                        <Label
                            htmlFor={`${label}-${locale}`}
                            className={cn(error ? 'text-red-600' : '')}
                        >
                            {label} {activeLocale ? '' : `(${locale.toUpperCase()})`}
                        </Label>

                        {type === 'textarea' ? (
                            <textarea
                                id={`${label}-${locale}`}
                                value={value?.[locale] ?? ''}
                                onChange={(event) => onChange(locale, event.target.value)}
                                placeholder={placeholder}
                                className={cn(
                                    'min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                    error ? 'border-red-500 ring-red-500/20' : '',
                                )}
                            />
                        ) : (
                            <Input
                                id={`${label}-${locale}`}
                                value={value?.[locale] ?? ''}
                                onChange={(event) => onChange(locale, event.target.value)}
                                placeholder={placeholder}
                                className={cn(error ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : '')}
                            />
                        )}

                        {error ? <p className="text-sm text-red-600">{error}</p> : null}
                        {activeLocale && hiddenLocaleErrors.length > 0 ? (
                            <p className="text-sm text-red-600">
                                Lipsește sau este invalid și pentru:{' '}
                                {hiddenLocaleErrors
                                    .map((item) => localeLabels[item] ?? item.toUpperCase())
                                    .join(', ')}
                                .
                            </p>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
