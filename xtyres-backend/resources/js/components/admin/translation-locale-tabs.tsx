type TranslationLocaleTabsProps = {
    value: 'ro' | 'ru';
    onChange: (locale: 'ro' | 'ru') => void;
};

const locales: Array<{ value: 'ro' | 'ru'; label: string }> = [
    { value: 'ro', label: 'Română' },
    { value: 'ru', label: 'Русский' },
];

export function TranslationLocaleTabs({
    value,
    onChange,
}: TranslationLocaleTabsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {locales.map((locale) => (
                <button
                    key={locale.value}
                    type="button"
                    onClick={() => onChange(locale.value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        value === locale.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    {locale.label}
                </button>
            ))}
        </div>
    );
}
