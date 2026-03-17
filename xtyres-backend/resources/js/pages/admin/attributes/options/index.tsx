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

type AttributeInfo = {
    id: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    type: string;
};

type OptionRow = {
    id: number;
    value: Record<string, string>;
    sort_order: number;
    is_active: boolean;
    products_count: number;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    attribute: AttributeInfo;
    filters: { search: string };
    options: Paginated<OptionRow>;
};

export default function AttributeOptionsIndex({
    attribute,
    filters,
    options,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Atribute', href: '/admin/attributes' },
        {
            title: localizedText(attribute.name),
            href: `/admin/attributes/${attribute.id}/edit`,
        },
        {
            title: 'Opțiuni',
            href: `/admin/attributes/${attribute.id}/options`,
        },
    ];

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            `/admin/attributes/${attribute.id}/options`,
            { search },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Opțiuni atribut - ${localizedText(attribute.name)}`} />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title={`Opțiuni: ${localizedText(attribute.name)}`}
                    description="Aici gestionezi toate valorile disponibile pentru atribut."
                    actions={
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/admin/attributes/${attribute.id}/edit`}>
                                    Înapoi la atribut
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/admin/attributes/${attribute.id}/options/create`}>
                                    Adaugă opțiune
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <Card className="p-4">
                    <form onSubmit={submitSearch} className="flex flex-col gap-3 md:flex-row">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Caută după valoare"
                        />
                        <Button type="submit">Caută</Button>
                    </form>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        Valoare
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        Ordine
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        Produse
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                                        Acțiuni
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {options.data.map((option) => (
                                    <tr key={option.id} className="border-t border-border">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">
                                                {localizedText(option.value)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                RO: {option.value.ro}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                RU: {option.value.ru}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">{option.sort_order}</td>
                                        <td className="px-6 py-4">{option.products_count}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    option.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {option.is_active ? 'Activă' : 'Inactivă'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link
                                                        href={`/admin/attributes/${attribute.id}/options/${option.id}/edit`}
                                                    >
                                                        Editează
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Ștergi această opțiune?',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/admin/attributes/${attribute.id}/options/${option.id}`,
                                                            );
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
                        <Pagination links={options.links} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
