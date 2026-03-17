import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

                return (
                    <div key={locale} className="space-y-2">
                        <Label htmlFor={`${label}-${locale}`}>
                            {label} {activeLocale ? '' : `(${locale.toUpperCase()})`}
                        </Label>

                        {type === 'textarea' ? (
                            <textarea
                                id={`${label}-${locale}`}
                                value={value?.[locale] ?? ''}
                                onChange={(event) => onChange(locale, event.target.value)}
                                placeholder={placeholder}
                                className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        ) : (
                            <Input
                                id={`${label}-${locale}`}
                                value={value?.[locale] ?? ''}
                                onChange={(event) => onChange(locale, event.target.value)}
                                placeholder={placeholder}
                            />
                        )}

                        {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    </div>
                );
            })}
        </div>
    );
}
