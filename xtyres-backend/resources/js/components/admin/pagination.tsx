import { Link } from '@inertiajs/react';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
};

export function Pagination({ links }: PaginationProps) {
    if (!links.length) {
        return null;
    }

    const normalizeUrl = (url: string) => {
        const normalized = new URL(url, 'http://localhost');

        return `${normalized.pathname}${normalized.search}${normalized.hash}`;
    };

    const normalizeLabel = (label: string) =>
        label
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/<[^>]+>/g, '')
            .trim();

    return (
        <div className="flex flex-wrap items-center gap-2">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={normalizeUrl(link.url)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                    >
                        {normalizeLabel(link.label)}
                    </Link>
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
                    >
                        {normalizeLabel(link.label)}
                    </span>
                ),
            )}
        </div>
    );
}
