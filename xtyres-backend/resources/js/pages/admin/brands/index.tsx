import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { localizedText } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type BrandRow = {
    id: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    description: Record<string, string>;
    website_url: string | null;
    logo_url: string | null;
    is_active: boolean;
    sort_order: number;
    products_count: number;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    filters: { search: string };
    brands: Paginated<BrandRow>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Branduri', href: '/admin/brands' },
];

export default function BrandsIndex({ filters, brands }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/brands', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branduri" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Branduri"
                    description="Adaugă și gestionează brandurile care pot fi alese la produse."
                    actions={
                        <Button asChild>
                            <Link href="/admin/brands/create">Adaugă brand</Link>
                        </Button>
                    }
                />

                <Card className="p-4">
                    <form onSubmit={submitSearch} className="flex flex-col gap-3 md:flex-row">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Caută după nume sau descriere"
                        />
                        <Button type="submit">Caută</Button>
                    </form>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Brand</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Slug</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Produse</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brands.data.map((brand) => (
                                    <tr key={brand.id} className="border-t border-border">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {brand.logo_url ? (
                                                    <img
                                                        src={brand.logo_url}
                                                        alt={localizedText(brand.name)}
                                                        className="size-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                                                        {localizedText(brand.name).slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{localizedText(brand.name)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {localizedText(brand.description)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{localizedText(brand.slug)}</td>
                                        <td className="px-6 py-4">{brand.products_count}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    brand.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {brand.is_active ? 'Activ' : 'Inactiv'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/brands/${brand.id}/edit`}>Editează</Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (window.confirm('Ștergi acest brand?')) {
                                                            router.delete(`/admin/brands/${brand.id}`);
                                                        }
                                                    }}
                                                >
                                                    Șterge
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-border px-6 py-4">
                        <Pagination links={brands.links} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
