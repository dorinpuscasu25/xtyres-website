import { cn } from '@/lib/utils';

type TranslationLocaleTabsProps = {
    value: 'ro' | 'ru';
    onChange: (locale: 'ro' | 'ru') => void;
    errors?: Record<string, string>;
};

const locales: Array<{ value: 'ro' | 'ru'; label: string }> = [
    { value: 'ro', label: 'Română' },
    { value: 'ru', label: 'Русский' },
];

function countLocaleErrors(errors: Record<string, string>, locale: 'ro' | 'ru'): number {
    const pattern = new RegExp(`(^|\\.)${locale}($|\\.)`);

    return Object.keys(errors).filter((key) => pattern.test(key)).length;
}

export function TranslationLocaleTabs({
    value,
    onChange,
    errors = {},
}: TranslationLocaleTabsProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {locales.map((locale) => {
                    const errorCount = countLocaleErrors(errors, locale.value);
                    const hasErrors = errorCount > 0;

                    return (
                        <button
                            key={locale.value}
                            type="button"
                            onClick={() => onChange(locale.value)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                                value === locale.value && !hasErrors
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
                                hasErrors &&
                                    (value === locale.value
                                        ? 'border-red-600 bg-red-600 text-white'
                                        : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'),
                            )}
                        >
                            <span>{locale.label}</span>
                            {hasErrors ? (
                                <span
                                    className={cn(
                                        'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                                        value === locale.value
                                            ? 'bg-white/20 text-white'
                                            : 'bg-red-100 text-red-700',
                                    )}
                                >
                                    {errorCount}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {locales.some((locale) => countLocaleErrors(errors, locale.value) > 0) ? (
                <p className="text-sm text-red-600">
                    Limbile marcate cu roșu au câmpuri incomplete sau invalide.
                </p>
            ) : null}
        </div>
    );
}
