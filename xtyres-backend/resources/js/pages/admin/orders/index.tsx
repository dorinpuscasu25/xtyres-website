import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import type { BreadcrumbItem } from '@/types';

type OrderRow = {
    id: number;
    order_number: string;
    status: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    payment_method: string;
    items_count: number;
    total: number;
    created_at: string | null;
};

type StatusOption = {
    value: string;
    label: string;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    filters: { search: string; status: string };
    statuses: StatusOption[];
    orders: Paginated<OrderRow>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Comenzi', href: '/admin/orders' },
];

const statusStyles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-amber-100 text-amber-700',
    processing: 'bg-violet-100 text-violet-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

export default function OrdersIndex({ filters, statuses, orders }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/orders', { search, status }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comenzi" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Comenzi"
                    description="Vezi comenzile primite din storefront și intră în detalii pentru actualizare."
                />

                <Card className="p-4">
                    <form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Caută după număr, client, telefon sau email"
                        />
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                            <option value="">Toate statusurile</option>
                            {statuses.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Button type="submit">Filtrează</Button>
                    </form>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Comandă</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Client</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Plată</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Produse</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Total</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Data</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="border-t border-border">
                                        <td className="px-6 py-4 font-medium">{order.order_number}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{order.customer_name}</p>
                                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                                            <p className="text-xs text-muted-foreground">{order.customer_email ?? '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 uppercase">{order.payment_method}</td>
                                        <td className="px-6 py-4">{order.items_count}</td>
                                        <td className="px-6 py-4">{order.total.toFixed(2)} MDL</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    statusStyles[order.status] ?? 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {statuses.find((item) => item.value === order.status)?.label ??
                                                    order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{order.created_at ?? '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/orders/${order.id}`}>Detalii</Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-border px-6 py-4">
                        <Pagination links={orders.links} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
