import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function localizedText(
    value: Record<string, string> | string | null | undefined,
    locale = 'ro',
    fallbackLocale = 'ru',
): string {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    return value[locale] ?? value[fallbackLocale] ?? Object.values(value)[0] ?? '';
}
