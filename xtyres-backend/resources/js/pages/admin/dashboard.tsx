import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import type { BreadcrumbItem } from '@/types';

type DashboardProps = {
    stats: Record<string, number>;
    recentProducts: Array<{
        id: number;
        name: string;
        sku: string;
        price: number;
        brand: string | null;
        category: string | null;
        is_active: boolean;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
];

export default function AdminDashboard({ stats, recentProducts }: DashboardProps) {
    const cards = [
        { label: 'Produse', value: stats.products },
        { label: 'Categorii', value: stats.categories },
        { label: 'Branduri', value: stats.brands },
        { label: 'Atribute', value: stats.attributes },
        { label: 'Comenzi', value: stats.orders },
        { label: 'Produse promovate', value: stats.featuredProducts },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Panou administrare"
                    description="Administrează catalogul, filtrele și setările generale ale magazinului."
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    {cards.map((card) => (
                        <Card key={card.label} className="p-5">
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
                        </Card>
                    ))}
                </div>

                <Card className="overflow-hidden">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="text-lg font-semibold">Produse recente</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Produs</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">SKU</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Brand</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Categorie</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Preț</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProducts.map((product) => (
                                    <tr key={product.id} className="border-t border-border">
                                        <td className="px-6 py-4 font-medium">{product.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{product.sku}</td>
                                        <td className="px-6 py-4">{product.brand ?? '—'}</td>
                                        <td className="px-6 py-4">{product.category ?? '—'}</td>
                                        <td className="px-6 py-4">{product.price.toFixed(2)} MDL</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    product.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {product.is_active ? 'Activ' : 'Inactiv'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
