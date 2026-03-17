import { usePage } from '@inertiajs/react';

type FlashData = {
    success?: string | null;
    error?: string | null;
};

export function FlashMessage() {
    const page = usePage<{ flash?: FlashData }>();
    const flash = page.props.flash ?? {};

    if (!flash.success && !flash.error) {
        return null;
    }

    return (
        <div className="space-y-3">
            {flash.success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {flash.success}
                </div>
            ) : null}

            {flash.error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {flash.error}
                </div>
            ) : null}
        </div>
    );
}
