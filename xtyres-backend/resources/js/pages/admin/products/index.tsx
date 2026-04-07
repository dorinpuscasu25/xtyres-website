import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { localizedText } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type ProductRow = {
    id: number;
    name: Record<string, string>;
    sku: string;
    price: number;
    compare_at_price: number | null;
    stock_quantity: number;
    brand: Record<string, string> | null;
    primary_category: Record<string, string> | null;
    categories_count: number;
    image_url: string | null;
    is_active: boolean;
    is_featured: boolean;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    filters: { search: string; per_page: number };
    products: Paginated<ProductRow>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Produse', href: '/admin/products' },
];

export default function ProductsIndex({ filters, products }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [perPage, setPerPage] = useState(String(filters.per_page ?? 250));
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [applyStock, setApplyStock] = useState(false);
    const [stockQuantity, setStockQuantity] = useState('');
    const [applyVisibility, setApplyVisibility] = useState(false);
    const [catalogVisibility, setCatalogVisibility] = useState<'visible' | 'hidden'>('visible');

    const currentPageProductIds = products.data.map((product) => product.id);
    const currentPageProductIdsKey = currentPageProductIds.join(',');
    const allSelectedOnPage =
        currentPageProductIds.length > 0 &&
        currentPageProductIds.every((productId) => selectedProductIds.includes(productId));

    useEffect(() => {
        setSelectedProductIds([]);
    }, [currentPageProductIdsKey]);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/products',
            { search, per_page: Number(perPage) },
            { preserveState: true, replace: true },
        );
    };

    const toggleProduct = (productId: number) => {
        setSelectedProductIds((current) =>
            current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
        );
    };

    const toggleSelectAll = () => {
        if (allSelectedOnPage) {
            setSelectedProductIds((current) => current.filter((id) => !currentPageProductIds.includes(id)));

            return;
        }

        setSelectedProductIds((current) => [...new Set([...current, ...currentPageProductIds])]);
    };

    const submitBulkUpdate = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            '/admin/products/bulk-update',
            {
                product_ids: selectedProductIds,
                apply_stock: applyStock,
                stock_quantity: applyStock && stockQuantity !== '' ? Number(stockQuantity) : null,
                apply_visibility: applyVisibility,
                is_active: applyVisibility ? catalogVisibility === 'visible' : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedProductIds([]);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produse" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Produse"
                    description="Catalogul principal al magazinului, cu preț, brand și atribute dinamice."
                    actions={
                        <Button asChild>
                            <Link href="/admin/products/create">Adaugă produs</Link>
                        </Button>
                    }
                />

                <Card className="p-4">
                    <form onSubmit={submitSearch} className="flex flex-col gap-3 md:flex-row">
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Caută după nume sau SKU"
                        />
                        <select
                            value={perPage}
                            onChange={(event) => setPerPage(event.target.value)}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                            {[25, 50, 100, 250].map((option) => (
                                <option key={option} value={option}>
                                    {option} / pagină
                                </option>
                            ))}
                        </select>
                        <Button type="submit">Caută</Button>
                    </form>
                </Card>

                <Card className="p-4">
                    <form onSubmit={submitBulkUpdate} className="space-y-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="font-medium">Editare în grup</p>
                                <p className="text-sm text-muted-foreground">
                                    Selectează produse din listă și aplică stocul sau vizibilitatea în catalog.
                                </p>
                            </div>
                            <p className="text-sm font-medium">
                                Selectate: {selectedProductIds.length}
                            </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-xl border border-border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={applyStock}
                                        onChange={(event) => setApplyStock(event.target.checked)}
                                    />
                                    Actualizează stocul
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={stockQuantity}
                                    onChange={(event) => setStockQuantity(event.target.value)}
                                    placeholder="Cantitate nouă"
                                    disabled={!applyStock}
                                    className="mt-3"
                                />
                            </div>

                            <div className="rounded-xl border border-border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={applyVisibility}
                                        onChange={(event) => setApplyVisibility(event.target.checked)}
                                    />
                                    Actualizează vizibilitatea în catalog
                                </label>
                                <select
                                    value={catalogVisibility}
                                    onChange={(event) =>
                                        setCatalogVisibility(event.target.value as 'visible' | 'hidden')
                                    }
                                    disabled={!applyVisibility}
                                    className="mt-3 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="visible">Vizibil</option>
                                    <option value="hidden">Ascuns</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={
                                    selectedProductIds.length === 0 ||
                                    (!applyStock && !applyVisibility) ||
                                    (applyStock && stockQuantity === '')
                                }
                            >
                                Aplică modificările
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Produs</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">SKU</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Brand</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Categorie</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Preț</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Stoc</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product) => (
                                    <tr key={product.id} className="border-t border-border">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedProductIds.includes(product.id)}
                                                onChange={() => toggleProduct(product.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={localizedText(product.name)}
                                                        className="size-14 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-14 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                                                        {localizedText(product.name).slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{localizedText(product.name)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.categories_count} categorii
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{product.sku}</td>
                                        <td className="px-6 py-4">
                                            {product.brand ? localizedText(product.brand) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.primary_category ? localizedText(product.primary_category) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium">{product.price.toFixed(2)} MDL</p>
                                                {product.compare_at_price ? (
                                                    <p className="text-xs text-muted-foreground line-through">
                                                        {product.compare_at_price.toFixed(2)} MDL
                                                    </p>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{product.stock_quantity}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        product.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {product.is_active ? 'Activ' : 'Inactiv'}
                                                </span>
                                                {product.is_featured ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                        Featured
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/products/${product.id}/edit`}>Editează</Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (window.confirm('Ștergi acest produs?')) {
                                                            router.delete(`/admin/products/${product.id}`);
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
                        <Pagination links={products.links} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
