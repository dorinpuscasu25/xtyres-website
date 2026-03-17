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

type CategoryRow = {
    id: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    description: Record<string, string>;
    parent: { id: number; name: Record<string, string> } | null;
    image_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    menu_order: number;
    products_count: number;
    children_count: number;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    filters: { search: string };
    categories: Paginated<CategoryRow>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Categorii', href: '/admin/categories' },
];

export default function CategoriesIndex({ filters, categories }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/categories', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorii" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Categorii"
                    description="Construiește structura de meniu cu categorii și subcategorii."
                    actions={
                        <Button asChild>
                            <Link href="/admin/categories/create">Adaugă categorie</Link>
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
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Categorie</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Părinte</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Ordine</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Produse</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.map((category) => (
                                    <tr key={category.id} className="border-t border-border">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {category.image_url ? (
                                                    <img
                                                        src={category.image_url}
                                                        alt={localizedText(category.name)}
                                                        className="size-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                                                        {localizedText(category.name).slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{localizedText(category.name)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {localizedText(category.slug)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {category.parent ? localizedText(category.parent.name) : '—'}
                                        </td>
                                        <td className="px-6 py-4">{category.menu_order}</td>
                                        <td className="px-6 py-4">
                                            {category.products_count} produse, {category.children_count} subcategorii
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        category.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {category.is_active ? 'Activă' : 'Inactivă'}
                                                </span>
                                                {category.is_featured ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                        Featured
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/categories/${category.id}/edit`}>Editează</Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (window.confirm('Ștergi această categorie?')) {
                                                            router.delete(`/admin/categories/${category.id}`);
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
                        <Pagination links={categories.links} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
