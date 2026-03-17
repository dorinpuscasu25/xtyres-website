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

    return (
        <div className="flex flex-wrap items-center gap-2">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}
