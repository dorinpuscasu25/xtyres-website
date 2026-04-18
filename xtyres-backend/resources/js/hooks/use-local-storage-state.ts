import { Dispatch, SetStateAction, useEffect, useState } from 'react';

function readStoredValue<T>(key: string, initialValue: T): T {
    if (typeof window === 'undefined') {
        return initialValue;
    }

    try {
        const rawValue = window.localStorage.getItem(key);

        if (!rawValue) {
            return initialValue;
        }

        return JSON.parse(rawValue) as T;
    } catch {
        return initialValue;
    }
}

export function useLocalStorageState<T>(
    key: string,
    initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() =>
        readStoredValue(key, initialValue),
    );

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}
