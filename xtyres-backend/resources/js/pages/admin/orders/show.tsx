import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import { localizedText } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type StatusOption = {
    value: string;
    label: string;
};

type OrderPayload = {
    id: number;
    order_number: string;
    status: string;
    locale: string;
    payment_method: string;
    currency: string;
    subtotal: number;
    total: number;
    note: string | null;
    admin_note: string | null;
    created_at: string | null;
    customer: {
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string;
        city: string;
        street: string;
        street_number: string;
        postal_code: string | null;
    };
    items: Array<{
        id: number;
        product_id: number | null;
        product_name: Record<string, string>;
        sku: string | null;
        quantity: number;
        unit_price: number;
        total_price: number;
        attributes_snapshot: Array<{ label: string; value: string }>;
    }>;
};

type Props = {
    order: OrderPayload;
    statuses: StatusOption[];
};

const statusStyles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-amber-100 text-amber-700',
    processing: 'bg-violet-100 text-violet-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

export default function OrderShow({ order, statuses }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Comenzi', href: '/admin/orders' },
        { title: order.order_number, href: `/admin/orders/${order.id}` },
    ];

    const form = useForm({
        status: order.status,
        admin_note: order.admin_note ?? '',
        _method: 'put',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/admin/orders/${order.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={order.order_number} />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title={`Comandă ${order.order_number}`}
                    description={`Plasată la ${order.created_at ?? '—'}`}
                    actions={
                        <Button asChild variant="outline">
                            <Link href="/admin/orders">Înapoi la comenzi</Link>
                        </Button>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <Card className="overflow-hidden">
                            <div className="border-b border-border px-6 py-4">
                                <h2 className="text-lg font-semibold">Produse comandate</h2>
                            </div>

                            <div className="divide-y divide-border">
                                {order.items.map((item) => (
                                    <div key={item.id} className="space-y-4 px-6 py-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium">
                                                    {localizedText(item.product_name)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {item.sku ?? '—'}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p>Cantitate: {item.quantity}</p>
                                                <p>Preț: {item.unit_price.toFixed(2)} MDL</p>
                                                <p className="font-semibold">
                                                    Total: {item.total_price.toFixed(2)} MDL
                                                </p>
                                            </div>
                                        </div>

                                        {item.attributes_snapshot.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {item.attributes_snapshot.map((attribute) => (
                                                    <span
                                                        key={`${attribute.label}-${attribute.value}`}
                                                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                                                    >
                                                        {attribute.label}: {attribute.value}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="space-y-4 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Status comandă</h2>
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                        statusStyles[order.status] ?? 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {statuses.find((item) => item.value === order.status)?.label ??
                                        order.status}
                                </span>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={form.data.status}
                                        onChange={(event) => form.setData('status', event.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="admin_note">Notă internă</Label>
                                    <textarea
                                        id="admin_note"
                                        value={form.data.admin_note}
                                        onChange={(event) =>
                                            form.setData('admin_note', event.target.value)
                                        }
                                        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    />
                                </div>

                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Se salvează...' : 'Salvează'}
                                </Button>
                            </form>
                        </Card>

                        <Card className="space-y-3 p-6">
                            <h2 className="text-lg font-semibold">Client</h2>
                            <p>
                                {order.customer.first_name} {order.customer.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Telefon: {order.customer.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Email: {order.customer.email ?? '—'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Adresă: {order.customer.city}, {order.customer.street}{' '}
                                {order.customer.street_number}
                                {order.customer.postal_code
                                    ? `, ${order.customer.postal_code}`
                                    : ''}
                            </p>
                        </Card>

                        <Card className="space-y-3 p-6">
                            <h2 className="text-lg font-semibold">Rezumat</h2>
                            <div className="flex justify-between text-sm">
                                <span>Plată</span>
                                <span className="uppercase">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{order.subtotal.toFixed(2)} MDL</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                                <span>Total</span>
                                <span>{order.total.toFixed(2)} MDL</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Limbă comandă: {order.locale.toUpperCase()}
                            </div>
                            {order.note ? (
                                <div className="rounded-xl bg-muted p-4 text-sm">
                                    <p className="mb-2 font-medium">Notă client</p>
                                    <p>{order.note}</p>
                                </div>
                            ) : null}
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
