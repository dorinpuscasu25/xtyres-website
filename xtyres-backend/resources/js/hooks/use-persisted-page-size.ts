import { useEffect, useRef } from 'react';

export const ADMIN_TABLE_PER_PAGE_OPTIONS = [10, 25, 50, 100, 250] as const;

function isValidPageSize(value: number): boolean {
    return ADMIN_TABLE_PER_PAGE_OPTIONS.includes(
        value as (typeof ADMIN_TABLE_PER_PAGE_OPTIONS)[number],
    );
}

export function usePersistedPageSize(
    tableKey: string,
    currentPageSize: number,
    onApply: (value: number) => void,
): (value: number) => void {
    const hasSyncedRef = useRef(false);
    const storageKey = `xtyres.admin-table.${tableKey}.per-page`;

    useEffect(() => {
        if (typeof window === 'undefined' || hasSyncedRef.current) {
            return;
        }

        hasSyncedRef.current = true;

        const storedValue = Number(window.localStorage.getItem(storageKey));

        if (!Number.isFinite(storedValue) || !isValidPageSize(storedValue)) {
            return;
        }

        if (storedValue !== currentPageSize) {
            onApply(storedValue);
        }
    }, [currentPageSize, onApply, storageKey]);

    return (value: number) => {
        if (!isValidPageSize(value)) {
            return;
        }

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, String(value));
        }

        onApply(value);
    };
}
