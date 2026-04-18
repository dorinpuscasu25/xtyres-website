import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import {
    Filter,
    ListFilter,
    PencilLine,
    Search,
    Settings2,
} from 'lucide-react';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useLocalStorageState } from '@/hooks/use-local-storage-state';
import {
    ADMIN_TABLE_PER_PAGE_OPTIONS,
    usePersistedPageSize,
} from '@/hooks/use-persisted-page-size';
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

type FilterOption = {
    id: number;
    name: Record<string, string>;
};

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    filters: {
        search: string;
        per_page: number;
        sku: string;
        brand_id: number | null;
        category_id: number | null;
        status: string;
        featured: string;
        stock_status: string;
        price_min: number | null;
        price_max: number | null;
    };
    filterOptions: {
        brands: FilterOption[];
        categories: FilterOption[];
    };
    products: Paginated<ProductRow>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Produse', href: '/admin/products' },
];

const PRODUCT_COLUMNS = [
    { id: 'product', label: 'Produs' },
    { id: 'sku', label: 'SKU' },
    { id: 'brand', label: 'Brand' },
    { id: 'category', label: 'Categorie' },
    { id: 'price', label: 'Preț' },
    { id: 'stock', label: 'Stoc' },
    { id: 'status', label: 'Status' },
] as const;

type ProductColumnId = (typeof PRODUCT_COLUMNS)[number]['id'];

const defaultVisibleColumns = PRODUCT_COLUMNS.map((column) => column.id);

function sanitizeVisibleColumns(columns: string[]): ProductColumnId[] {
    const normalized = PRODUCT_COLUMNS.map((column) => column.id).filter((id) =>
        columns.includes(id),
    );

    return normalized.length > 0 ? normalized : defaultVisibleColumns;
}

export default function ProductsIndex({
    filters,
    filterOptions,
    products,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [skuFilter, setSkuFilter] = useState(filters.sku ?? '');
    const [brandFilter, setBrandFilter] = useState(
        filters.brand_id ? String(filters.brand_id) : '',
    );
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category_id ? String(filters.category_id) : '',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [featuredFilter, setFeaturedFilter] = useState(
        filters.featured ?? '',
    );
    const [stockStatusFilter, setStockStatusFilter] = useState(
        filters.stock_status ?? '',
    );
    const [priceMin, setPriceMin] = useState(
        filters.price_min !== null ? String(filters.price_min) : '',
    );
    const [priceMax, setPriceMax] = useState(
        filters.price_max !== null ? String(filters.price_max) : '',
    );
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [applyStock, setApplyStock] = useState(false);
    const [stockQuantity, setStockQuantity] = useState('');
    const [applyVisibility, setApplyVisibility] = useState(false);
    const [catalogVisibility, setCatalogVisibility] = useState<
        'visible' | 'hidden'
    >('visible');
    const [applyFeatured, setApplyFeatured] = useState(false);
    const [featuredVisibility, setFeaturedVisibility] = useState<
        'featured' | 'regular'
    >('featured');
    const [visibleColumns, setVisibleColumns] = useLocalStorageState<
        ProductColumnId[]
    >('xtyres.admin-table.products.columns', defaultVisibleColumns);

    const currentPageProductIds = products.data.map((product) => product.id);
    const currentPageProductIdsKey = currentPageProductIds.join(',');
    const allSelectedOnPage =
        currentPageProductIds.length > 0 &&
        currentPageProductIds.every((productId) =>
            selectedProductIds.includes(productId),
        );
    const activeFiltersCount = [
        skuFilter,
        brandFilter,
        categoryFilter,
        statusFilter,
        featuredFilter,
        stockStatusFilter,
        priceMin,
        priceMax,
    ].filter((value) => value !== '').length;

    useEffect(() => {
        setVisibleColumns((current) => sanitizeVisibleColumns(current));
    }, [setVisibleColumns]);

    useEffect(() => {
        setSelectedProductIds([]);
    }, [currentPageProductIdsKey]);

    const buildQuery = (
        overrides: Partial<{
            search: string;
            per_page: number;
            sku: string;
            brand_id: string;
            category_id: string;
            status: string;
            featured: string;
            stock_status: string;
            price_min: string;
            price_max: string;
        }> = {},
    ) => {
        const values = {
            search,
            per_page: filters.per_page ?? 250,
            sku: skuFilter,
            brand_id: brandFilter,
            category_id: categoryFilter,
            status: statusFilter,
            featured: featuredFilter,
            stock_status: stockStatusFilter,
            price_min: priceMin,
            price_max: priceMax,
            ...overrides,
        };

        return Object.fromEntries(
            Object.entries(values).filter(
                ([, value]) => value !== '' && value !== null && value !== undefined,
            ),
        );
    };

    const applyFilters = (queryOverrides: Parameters<typeof buildQuery>[0] = {}) => {
        router.get('/admin/products', buildQuery(queryOverrides), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setPageSize = usePersistedPageSize(
        'products',
        filters.per_page ?? 250,
        (value) => {
            applyFilters({ per_page: value });
        },
    );

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters();
    };

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        setIsFiltersOpen(false);
        applyFilters();
    };

    const resetFilters = () => {
        setSearch('');
        setSkuFilter('');
        setBrandFilter('');
        setCategoryFilter('');
        setStatusFilter('');
        setFeaturedFilter('');
        setStockStatusFilter('');
        setPriceMin('');
        setPriceMax('');
        setIsFiltersOpen(false);

        router.get(
            '/admin/products',
            { per_page: filters.per_page ?? 250 },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const toggleProduct = (productId: number) => {
        setSelectedProductIds((current) =>
            current.includes(productId)
                ? current.filter((id) => id !== productId)
                : [...current, productId],
        );
    };

    const toggleSelectAll = () => {
        if (allSelectedOnPage) {
            setSelectedProductIds((current) =>
                current.filter((id) => !currentPageProductIds.includes(id)),
            );

            return;
        }

        setSelectedProductIds((current) => [
            ...new Set([...current, ...currentPageProductIds]),
        ]);
    };

    const resetBulkEdit = () => {
        setApplyStock(false);
        setStockQuantity('');
        setApplyVisibility(false);
        setCatalogVisibility('visible');
        setApplyFeatured(false);
        setFeaturedVisibility('featured');
    };

    const submitBulkUpdate = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            '/admin/products/bulk-update',
            {
                product_ids: selectedProductIds,
                apply_stock: applyStock,
                stock_quantity:
                    applyStock && stockQuantity !== ''
                        ? Number(stockQuantity)
                        : null,
                apply_visibility: applyVisibility,
                is_active: applyVisibility
                    ? catalogVisibility === 'visible'
                    : null,
                apply_featured: applyFeatured,
                is_featured: applyFeatured
                    ? featuredVisibility === 'featured'
                    : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedProductIds([]);
                    setIsBulkEditOpen(false);
                    resetBulkEdit();
                },
            },
        );
    };

    const toggleColumn = (columnId: ProductColumnId) => {
        setVisibleColumns((current) => {
            if (current.includes(columnId)) {
                const next = current.filter((id) => id !== columnId);

                return next.length > 0 ? next : current;
            }

            return sanitizeVisibleColumns([...current, columnId]);
        });
    };

    const isColumnVisible = (columnId: ProductColumnId) =>
        visibleColumns.includes(columnId);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produse" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Produse"
                    description="Catalogul principal al magazinului, cu filtrare, opțiuni de ecran și editare în grup."
                    actions={
                        <Button asChild>
                            <Link href="/admin/products/create">Adaugă produs</Link>
                        </Button>
                    }
                />

                <Card className="space-y-4 p-4">
                    <form
                        onSubmit={submitSearch}
                        className="flex flex-col gap-3 xl:flex-row xl:items-center"
                    >
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Caută după nume sau SKU"
                                className="pl-9"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button type="submit">Caută</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFiltersOpen(true)}
                            >
                                <Filter className="mr-2 size-4" />
                                Filtre
                                {activeFiltersCount > 0
                                    ? ` (${activeFiltersCount})`
                                    : ''}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="outline">
                                        <Settings2 className="mr-2 size-4" />
                                        Opțiuni ecran
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-64"
                                >
                                    <DropdownMenuLabel>
                                        Coloane vizibile
                                    </DropdownMenuLabel>
                                    {PRODUCT_COLUMNS.map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={isColumnVisible(column.id)}
                                            onCheckedChange={() =>
                                                toggleColumn(column.id)
                                            }
                                        >
                                            {column.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>
                                        Elemente pe pagină
                                    </DropdownMenuLabel>
                                    <DropdownMenuRadioGroup
                                        value={String(filters.per_page ?? 250)}
                                        onValueChange={(value) =>
                                            setPageSize(Number(value))
                                        }
                                    >
                                        {ADMIN_TABLE_PER_PAGE_OPTIONS.map(
                                            (option) => (
                                                <DropdownMenuRadioItem
                                                    key={option}
                                                    value={String(option)}
                                                >
                                                    {option} / pagină
                                                </DropdownMenuRadioItem>
                                            ),
                                        )}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {selectedProductIds.length > 0 ? (
                                <Button
                                    type="button"
                                    onClick={() => setIsBulkEditOpen(true)}
                                >
                                    <PencilLine className="mr-2 size-4" />
                                    Editează în grup ({selectedProductIds.length})
                                </Button>
                            ) : null}
                        </div>
                    </form>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>
                            Selectează coloanele pe care vrei să le vezi și
                            salvează automat preferințele după refresh.
                        </span>
                        <span>Pagina curentă: {filters.per_page ?? 250} / pagină.</span>
                    </div>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                        <input
                                            type="checkbox"
                                            checked={allSelectedOnPage}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    {isColumnVisible('product') ? (
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Produs
                                        </th>
                                    ) : null}
                                    {isColumnVisible('sku') ? (
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            SKU
                                        </th>
                                    ) : null}
                                    {isColumnVisible('brand') ? (
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Brand
                                        </th>
                                    ) : null}
                                    {isColumnVisible('category') ? (
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Categorie
                                        </th>
                                    ) : null}
                                    {isColumnVisible('price') ? (
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Preț
                                        </th>
                                    ) : null}
                                    {isColumnVisible('stock') ? (
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Stoc
                                        </th>
                                    ) : null}
                                    {isColumnVisible('status') ? (
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Status
                                        </th>
                                    ) : null}
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                                        Acțiuni
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="border-t border-border"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProductIds.includes(
                                                        product.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleProduct(
                                                            product.id,
                                                        )
                                                    }
                                                />
                                            </td>
                                            {isColumnVisible('product') ? (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {product.image_url ? (
                                                            <img
                                                                src={
                                                                    product.image_url
                                                                }
                                                                alt={localizedText(
                                                                    product.name,
                                                                )}
                                                                className="size-14 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-14 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                                                                {localizedText(
                                                                    product.name,
                                                                )
                                                                    .slice(
                                                                        0,
                                                                        2,
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">
                                                                {localizedText(
                                                                    product.name,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    product.categories_count
                                                                }{' '}
                                                                categorii
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            ) : null}
                                            {isColumnVisible('sku') ? (
                                                <td className="px-6 py-4">
                                                    {product.sku}
                                                </td>
                                            ) : null}
                                            {isColumnVisible('brand') ? (
                                                <td className="px-6 py-4">
                                                    {product.brand
                                                        ? localizedText(
                                                              product.brand,
                                                          )
                                                        : '—'}
                                                </td>
                                            ) : null}
                                            {isColumnVisible('category') ? (
                                                <td className="px-6 py-4">
                                                    {product.primary_category
                                                        ? localizedText(
                                                              product.primary_category,
                                                          )
                                                        : '—'}
                                                </td>
                                            ) : null}
                                            {isColumnVisible('price') ? (
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {product.price.toFixed(
                                                                2,
                                                            )}{' '}
                                                            MDL
                                                        </p>
                                                        {product.compare_at_price ? (
                                                            <p className="text-xs text-muted-foreground line-through">
                                                                {product.compare_at_price.toFixed(
                                                                    2,
                                                                )}{' '}
                                                                MDL
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            ) : null}
                                            {isColumnVisible('stock') ? (
                                                <td className="px-6 py-4">
                                                    {product.stock_quantity}
                                                </td>
                                            ) : null}
                                            {isColumnVisible('status') ? (
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                product.is_active
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {product.is_active
                                                                ? 'Activ'
                                                                : 'Inactiv'}
                                                        </span>
                                                        {product.is_featured ? (
                                                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                                Featured
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            ) : null}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
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
                                                                    'Ștergi acest produs?',
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/admin/products/${product.id}`,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Șterge
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                visibleColumns.length + 2
                                            }
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            Nu am găsit produse pentru
                                            filtrele selectate.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-border px-6 py-4">
                        <Pagination links={products.links} />
                    </div>
                </Card>
            </div>

            <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Filtrare produse</DialogTitle>
                        <DialogDescription>
                            Filtrează după coloanele principale din tabel și
                            aplică rapid combinațiile de care ai nevoie.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitFilters} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Căutare generală
                                </label>
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Nume sau SKU"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    SKU
                                </label>
                                <Input
                                    value={skuFilter}
                                    onChange={(event) =>
                                        setSkuFilter(event.target.value)
                                    }
                                    placeholder="Ex: SKU-123"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Brand
                                </label>
                                <select
                                    value={brandFilter}
                                    onChange={(event) =>
                                        setBrandFilter(event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="">Toate brandurile</option>
                                    {filterOptions.brands.map((brand) => (
                                        <option
                                            key={brand.id}
                                            value={brand.id}
                                        >
                                            {localizedText(brand.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Categorie
                                </label>
                                <select
                                    value={categoryFilter}
                                    onChange={(event) =>
                                        setCategoryFilter(event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="">Toate categoriile</option>
                                    {filterOptions.categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {localizedText(category.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="">Toate statusurile</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Featured
                                </label>
                                <select
                                    value={featuredFilter}
                                    onChange={(event) =>
                                        setFeaturedFilter(event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="">Toate</option>
                                    <option value="featured">Doar featured</option>
                                    <option value="regular">Doar normale</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Stoc
                                </label>
                                <select
                                    value={stockStatusFilter}
                                    onChange={(event) =>
                                        setStockStatusFilter(event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="">Orice stoc</option>
                                    <option value="in_stock">În stoc</option>
                                    <option value="low_stock">
                                        Stoc redus (1-5)
                                    </option>
                                    <option value="out_of_stock">
                                        Fără stoc
                                    </option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Preț minim
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={priceMin}
                                    onChange={(event) =>
                                        setPriceMin(event.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Preț maxim
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={priceMax}
                                    onChange={(event) =>
                                        setPriceMax(event.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetFilters}
                            >
                                <ListFilter className="mr-2 size-4" />
                                Resetează filtrele
                            </Button>
                            <Button type="submit">Aplică filtrarea</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Editare în grup</DialogTitle>
                        <DialogDescription>
                            Selectate: {selectedProductIds.length} produse.
                            Alege exact câmpurile pe care vrei să le modifici.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitBulkUpdate} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="rounded-xl border border-border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={applyStock}
                                        onChange={(event) =>
                                            setApplyStock(
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Actualizează stocul
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={stockQuantity}
                                    onChange={(event) =>
                                        setStockQuantity(event.target.value)
                                    }
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
                                        onChange={(event) =>
                                            setApplyVisibility(
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Actualizează vizibilitatea în catalog
                                </label>
                                <select
                                    value={catalogVisibility}
                                    onChange={(event) =>
                                        setCatalogVisibility(
                                            event.target.value as
                                                | 'visible'
                                                | 'hidden',
                                        )
                                    }
                                    disabled={!applyVisibility}
                                    className="mt-3 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="visible">Vizibil</option>
                                    <option value="hidden">Ascuns</option>
                                </select>
                            </div>

                            <div className="rounded-xl border border-border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={applyFeatured}
                                        onChange={(event) =>
                                            setApplyFeatured(
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Actualizează starea featured
                                </label>
                                <select
                                    value={featuredVisibility}
                                    onChange={(event) =>
                                        setFeaturedVisibility(
                                            event.target.value as
                                                | 'featured'
                                                | 'regular',
                                        )
                                    }
                                    disabled={!applyFeatured}
                                    className="mt-3 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="featured">
                                        Marchează ca featured
                                    </option>
                                    <option value="regular">
                                        Scoate din featured
                                    </option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsBulkEditOpen(false);
                                    resetBulkEdit();
                                }}
                            >
                                Anulează
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    selectedProductIds.length === 0 ||
                                    (!applyStock &&
                                        !applyVisibility &&
                                        !applyFeatured) ||
                                    (applyStock && stockQuantity === '')
                                }
                            >
                                Aplică modificările
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
