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

type AttributeRow = {
    id: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    description: Record<string, string>;
    type: string;
    is_filterable: boolean;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    supports_options: boolean;
    categories: Array<{ id: number; name: Record<string, string> }>;
    options_count: number;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    filters: { search: string };
    attributes: Paginated<AttributeRow>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Atribute', href: '/admin/attributes' },
];

export default function AttributesIndex({ filters, attributes }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/attributes', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Atribute" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Atribute"
                    description="Leagă atributele de categorii și marchează ce trebuie să intre în filtre."
                    actions={
                        <Button asChild>
                            <Link href="/admin/attributes/create">Adaugă atribut</Link>
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
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Atribut</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Tip</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Categorii</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Opțiuni</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attributes.data.map((attribute) => (
                                    <tr key={attribute.id} className="border-t border-border">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{localizedText(attribute.name)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {localizedText(attribute.slug)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 uppercase">{attribute.type}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {attribute.categories.map((category) => (
                                                    <span
                                                        key={category.id}
                                                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                                                    >
                                                        {localizedText(category.name)}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{attribute.options_count}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        attribute.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {attribute.is_active ? 'Activ' : 'Inactiv'}
                                                </span>
                                                {attribute.is_filterable ? (
                                                    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                        Filtru
                                                    </span>
                                                ) : null}
                                                {attribute.is_required ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                        Obligatoriu
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {attribute.supports_options ? (
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/admin/attributes/${attribute.id}/options`}>
                                                            Opțiuni
                                                        </Link>
                                                    </Button>
                                                ) : null}
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/attributes/${attribute.id}/edit`}>Editează</Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (window.confirm('Ștergi acest atribut?')) {
                                                            router.delete(`/admin/attributes/${attribute.id}`);
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
                        <Pagination links={attributes.links} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
