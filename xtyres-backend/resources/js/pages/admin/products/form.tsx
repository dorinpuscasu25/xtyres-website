import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import { TranslationFields } from '@/components/admin/translation-fields';
import { TranslationLocaleTabs } from '@/components/admin/translation-locale-tabs';
import { CategoryTreeSelector } from '@/components/admin/category-tree-selector';
import { localizedText } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type CategoryNode = {
    id: number;
    name: Record<string, string>;
    children: CategoryNode[];
};

type BrandOption = {
    id: number;
    name: Record<string, string>;
};

type AttributeOption = {
    id: number;
    value: Record<string, string>;
};

type AttributeDefinition = {
    id: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    description: Record<string, string>;
    type: string;
    is_filterable: boolean;
    is_required: boolean;
    category_ids: number[];
    options: AttributeOption[];
};

type AttributeValueInput = {
    attribute_id: number;
    type: string;
    option_ids?: number[];
    text_value?: Record<string, string>;
    number_value?: string;
    boolean_value?: boolean;
};

type ExistingGalleryImage = {
    id: number;
    image_url: string;
    sort_order: number;
};

type ProductFormData = {
    id?: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    short_description: Record<string, string>;
    description: Record<string, string>;
    meta_title: Record<string, string>;
    meta_keywords: Record<string, string>;
    meta_description: Record<string, string>;
    sku: string;
    brand_id: number | null;
    primary_category_id: number | null;
    category_ids: number[];
    price: string;
    compare_at_price: string;
    stock_quantity: number;
    gallery_images: ExistingGalleryImage[];
    gallery_order: string[];
    new_images: File[];
    new_image_keys: string[];
    removed_image_ids: number[];
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    attribute_values: AttributeValueInput[];
    _method?: 'put';
};

type Props = {
    mode: 'create' | 'edit';
    product: ProductFormData;
    brands: BrandOption[];
    categoryTree: CategoryNode[];
    attributes: AttributeDefinition[];
};

type NewGalleryUpload = {
    tempKey: string;
    file: File;
    previewUrl: string;
};

type GalleryItem = {
    key: string;
    type: 'existing' | 'new';
    imageUrl: string;
    existingId?: number;
    tempKey?: string;
};

export default function ProductForm({ mode, product, brands, categoryTree, attributes }: Props) {
    const [activeTab, setActiveTab] = useState<'data' | 'seo'>('data');
    const [activeLocale, setActiveLocale] = useState<'ro' | 'ru'>('ro');
    const [activeSeoLocale, setActiveSeoLocale] = useState<'ro' | 'ru'>('ro');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Produse', href: '/admin/products' },
        {
            title: mode === 'create' ? 'Adaugă produs' : 'Editează produs',
            href: mode === 'create' ? '/admin/products/create' : `/admin/products/${product.id}/edit`,
        },
    ];

    const [newUploads, setNewUploads] = useState<NewGalleryUpload[]>([]);
    const [draggedGalleryKey, setDraggedGalleryKey] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const uploadsRef = useRef<NewGalleryUpload[]>([]);
    const form = useForm<ProductFormData>({
        ...product,
        _method: mode === 'edit' ? 'put' : undefined,
    });
    const errors = form.errors as Record<string, string>;

    const flatCategories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
    const availableAttributes = useMemo(
        () =>
            attributes.filter((attribute) =>
                attribute.category_ids.some((id) => form.data.category_ids.includes(id)),
            ),
        [attributes, form.data.category_ids],
    );

    useEffect(() => {
        const availableIds = new Set(availableAttributes.map((attribute) => attribute.id));
        const filtered = form.data.attribute_values.filter((item) => availableIds.has(item.attribute_id));

        if (filtered.length !== form.data.attribute_values.length) {
            form.setData('attribute_values', filtered);
        }

        if (
            form.data.primary_category_id &&
            !form.data.category_ids.includes(form.data.primary_category_id)
        ) {
            form.setData('primary_category_id', null);
        }
    }, [availableAttributes, form]);

    useEffect(() => {
        uploadsRef.current = newUploads;
    }, [newUploads]);

    useEffect(() => {
        return () => {
            uploadsRef.current.forEach((upload) => URL.revokeObjectURL(upload.previewUrl));
        };
    }, []);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const url = mode === 'create' ? '/admin/products' : `/admin/products/${product.id}`;
        form.post(url, { forceFormData: true });
    };

    const toggleCategory = (id: number) => {
        form.setData(
            'category_ids',
            form.data.category_ids.includes(id)
                ? form.data.category_ids.filter((value) => value !== id)
                : [...form.data.category_ids, id],
        );
    };

    const selectedCategories = flatCategories.filter((category) =>
        form.data.category_ids.includes(category.id),
    );

    const ensureAttributeEntry = (attribute: AttributeDefinition): AttributeValueInput => {
        return (
            form.data.attribute_values.find((item) => item.attribute_id === attribute.id) ?? {
                attribute_id: attribute.id,
                type: attribute.type,
                option_ids: [],
                text_value: { ro: '', ru: '' },
                number_value: '',
                boolean_value: false,
            }
        );
    };

    const upsertAttributeEntry = (attribute: AttributeDefinition, nextValue: Partial<AttributeValueInput>) => {
        const existing = ensureAttributeEntry(attribute);
        const nextEntry: AttributeValueInput = { ...existing, ...nextValue, attribute_id: attribute.id, type: attribute.type };
        const remaining = form.data.attribute_values.filter((item) => item.attribute_id !== attribute.id);

        form.setData('attribute_values', [...remaining, nextEntry]);
    };

    const syncNewUploads = (uploads: NewGalleryUpload[]) => {
        setNewUploads(uploads);
        form.setData('new_images', uploads.map((upload) => upload.file));
        form.setData('new_image_keys', uploads.map((upload) => upload.tempKey));
    };

    const handleFileSelection = (files: FileList | File[]) => {
        const nextFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

        if (nextFiles.length === 0) {
            return;
        }

        const uploads = nextFiles.map((file) => ({
            tempKey: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        const nextUploads = [...newUploads, ...uploads];
        syncNewUploads(nextUploads);
        form.setData('gallery_order', [
            ...form.data.gallery_order,
            ...uploads.map((upload) => `new:${upload.tempKey}`),
        ]);
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            handleFileSelection(event.target.files);
        }

        event.target.value = '';
    };

    const removeGalleryItem = (item: GalleryItem) => {
        if (item.type === 'existing' && item.existingId) {
            form.setData(
                'gallery_images',
                form.data.gallery_images.filter((image) => image.id !== item.existingId),
            );
            form.setData('removed_image_ids', [
                ...new Set([...form.data.removed_image_ids, item.existingId]),
            ]);
            form.setData(
                'gallery_order',
                form.data.gallery_order.filter((key) => key !== item.key),
            );

            return;
        }

        if (item.type === 'new' && item.tempKey) {
            const upload = newUploads.find((entry) => entry.tempKey === item.tempKey);
            if (upload) {
                URL.revokeObjectURL(upload.previewUrl);
            }

            const nextUploads = newUploads.filter((entry) => entry.tempKey !== item.tempKey);
            syncNewUploads(nextUploads);
            form.setData(
                'gallery_order',
                form.data.gallery_order.filter((key) => key !== item.key),
            );
        }
    };

    const moveGalleryItem = (draggedKey: string, targetKey: string) => {
        if (draggedKey === targetKey) {
            return;
        }

        const nextOrder = [...form.data.gallery_order];
        const draggedIndex = nextOrder.indexOf(draggedKey);
        const targetIndex = nextOrder.indexOf(targetKey);

        if (draggedIndex === -1 || targetIndex === -1) {
            return;
        }

        nextOrder.splice(draggedIndex, 1);
        nextOrder.splice(targetIndex, 0, draggedKey);
        form.setData('gallery_order', nextOrder);
    };

    const handleGalleryDrop = (event: DragEvent<HTMLDivElement>, targetKey?: string) => {
        event.preventDefault();

        if (event.dataTransfer.files.length > 0) {
            handleFileSelection(event.dataTransfer.files);
            setDraggedGalleryKey(null);

            return;
        }

        if (draggedGalleryKey && targetKey) {
            moveGalleryItem(draggedGalleryKey, targetKey);
        }

        setDraggedGalleryKey(null);
    };

    const galleryItems = useMemo<GalleryItem[]>(() => {
        const existingItems: GalleryItem[] = form.data.gallery_images.map((image) => ({
            key: `existing:${image.id}`,
            type: 'existing' as const,
            imageUrl: image.image_url,
            existingId: image.id,
        }));
        const newItems: GalleryItem[] = newUploads.map((upload) => ({
            key: `new:${upload.tempKey}`,
            type: 'new' as const,
            imageUrl: upload.previewUrl,
            tempKey: upload.tempKey,
        }));

        const items: GalleryItem[] = [...existingItems, ...newItems];
        const itemMap = new Map(items.map((item) => [item.key, item]));
        const ordered = form.data.gallery_order
            .map((key) => itemMap.get(key))
            .filter((item): item is GalleryItem => item !== undefined);
        const missing = items.filter((item) => !form.data.gallery_order.includes(item.key));

        return [...ordered, ...missing];
    }, [form.data.gallery_images, form.data.gallery_order, newUploads]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mode === 'create' ? 'Adaugă produs' : 'Editează produs'} />

            <form onSubmit={submit} className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title={mode === 'create' ? 'Adaugă produs' : 'Editează produs'}
                    description="Atributele disponibile se actualizează în funcție de categoriile selectate."
                    actions={
                        <Button asChild variant="outline">
                            <Link href="/admin/products">Înapoi la listă</Link>
                        </Button>
                    }
                />

                <Card className="p-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('data')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'data'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            Data
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('seo')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'seo'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            SEO
                        </button>
                    </div>
                </Card>

                {activeTab === 'data' ? (
                    <>
                        <Card className="p-4">
                            <TranslationLocaleTabs value={activeLocale} onChange={setActiveLocale} />
                        </Card>

                        <Card className="space-y-6 p-6">
                            <TranslationFields
                                fieldName="name"
                                label="Nume"
                                value={form.data.name}
                                onChange={(locale, value) =>
                                    form.setData('name', { ...form.data.name, [locale]: value })
                                }
                                errors={errors}
                                activeLocale={activeLocale}
                            />

                            <TranslationFields
                                fieldName="slug"
                                label="Slug"
                                value={form.data.slug}
                                onChange={(locale, value) =>
                                    form.setData('slug', { ...form.data.slug, [locale]: value })
                                }
                                errors={errors}
                                activeLocale={activeLocale}
                            />

                            <TranslationFields
                                fieldName="short_description"
                                label="Descriere scurtă"
                                type="textarea"
                                value={form.data.short_description}
                                onChange={(locale, value) =>
                                    form.setData('short_description', {
                                        ...form.data.short_description,
                                        [locale]: value,
                                    })
                                }
                                errors={errors}
                                activeLocale={activeLocale}
                            />

                            <TranslationFields
                                fieldName="description"
                                label="Descriere completă"
                                type="textarea"
                                value={form.data.description}
                                onChange={(locale, value) =>
                                    form.setData('description', {
                                        ...form.data.description,
                                        [locale]: value,
                                    })
                                }
                                errors={errors}
                                activeLocale={activeLocale}
                            />

                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={form.data.sku}
                                        onChange={(event) => form.setData('sku', event.target.value)}
                                    />
                                    {errors.sku ? <p className="text-sm text-red-600">{errors.sku}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand_id">Brand</Label>
                                    <select
                                        id="brand_id"
                                        value={form.data.brand_id ?? ''}
                                        onChange={(event) =>
                                            form.setData(
                                                'brand_id',
                                                event.target.value ? Number(event.target.value) : null,
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                    >
                                        <option value="">Fără brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {localizedText(brand.name)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Preț</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={form.data.price}
                                        onChange={(event) => form.setData('price', event.target.value)}
                                    />
                                    {errors.price ? <p className="text-sm text-red-600">{errors.price}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="compare_at_price">Preț vechi</Label>
                                    <Input
                                        id="compare_at_price"
                                        type="number"
                                        step="0.01"
                                        value={form.data.compare_at_price}
                                        onChange={(event) => form.setData('compare_at_price', event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="stock_quantity">Stoc</Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        value={form.data.stock_quantity}
                                        onChange={(event) =>
                                            form.setData('stock_quantity', Number(event.target.value))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Ordine</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={form.data.sort_order}
                                        onChange={(event) =>
                                            form.setData('sort_order', Number(event.target.value))
                                        }
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="space-y-6 p-6">
                            <div className="space-y-3">
                                <Label>Categorii</Label>
                                <CategoryTreeSelector
                                    nodes={categoryTree}
                                    selectedIds={form.data.category_ids}
                                    onToggle={toggleCategory}
                                />
                                {errors.category_ids ? (
                                    <p className="text-sm text-red-600">{errors.category_ids}</p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="primary_category_id">Categorie principală</Label>
                                <select
                                    id="primary_category_id"
                                    value={form.data.primary_category_id ?? ''}
                                    onChange={(event) =>
                                        form.setData(
                                            'primary_category_id',
                                            event.target.value ? Number(event.target.value) : null,
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    <option value="">Alege categoria principală</option>
                                    {selectedCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {localizedText(category.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Card>

                        <Card className="space-y-4 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">Atribute produs</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Câmpurile se formează pe baza atributelor legate de categorie.
                                    </p>
                                </div>
                            </div>

                            {availableAttributes.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                    Selectează cel puțin o categorie pentru a vedea atributele disponibile.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableAttributes.map((attribute) => (
                                        <ProductAttributeField
                                            key={attribute.id}
                                            attribute={attribute}
                                            value={ensureAttributeEntry(attribute)}
                                            activeLocale={activeLocale}
                                            onChange={(next) => upsertAttributeEntry(attribute, next)}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card className="space-y-6 p-6">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">Galerie produs</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Adaugă mai multe imagini, reordonează-le prin drag and drop, iar prima imagine
                                            va fi thumbnail-ul produsului.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImagePlus className="mr-2 h-4 w-4" />
                                        Adaugă imagini
                                    </Button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={onFileChange}
                                />

                                <div
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={handleGalleryDrop}
                                    className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center"
                                >
                                    <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        Trage imaginile aici sau apasă pe butonul de mai sus.
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Poți selecta mai multe fișiere deodată.
                                    </p>
                                </div>

                                {errors.new_images ? <p className="text-sm text-red-600">{errors.new_images}</p> : null}

                                {galleryItems.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        {galleryItems.map((item, index) => (
                                            <div
                                                key={item.key}
                                                draggable
                                                onDragStart={() => setDraggedGalleryKey(item.key)}
                                                onDragEnd={() => setDraggedGalleryKey(null)}
                                                onDragOver={(event) => event.preventDefault()}
                                                onDrop={(event) => handleGalleryDrop(event, item.key)}
                                                className="group rounded-2xl border border-border bg-background p-3 shadow-sm"
                                            >
                                                <div className="relative overflow-hidden rounded-xl border border-border">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={`Product image ${index + 1}`}
                                                        className="h-44 w-full object-cover"
                                                    />

                                                    <div className="absolute left-2 top-2 flex gap-2">
                                                        {index === 0 ? (
                                                            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                                                                Thumbnail
                                                            </span>
                                                        ) : null}

                                                        <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium">
                                                            #{index + 1}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryItem(item)}
                                                        className="absolute right-2 top-2 rounded-full bg-background/90 p-2 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical className="h-4 w-4" />
                                                        Mută prin drag & drop
                                                    </div>
                                                    <span>{item.type === 'existing' ? 'Salvată' : 'Nouă'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                        Nu ai adăugat încă imagini pentru acest produs.
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(event) => form.setData('is_active', event.target.checked)}
                                    />
                                    Produs activ
                                </label>

                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_featured}
                                        onChange={(event) => form.setData('is_featured', event.target.checked)}
                                    />
                                    Featured pe homepage
                                </label>
                            </div>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card className="p-4">
                            <TranslationLocaleTabs value={activeSeoLocale} onChange={setActiveSeoLocale} />
                        </Card>

                        <Card className="space-y-6 p-6">
                            <TranslationFields
                                fieldName="meta_title"
                                label="Meta title"
                                value={form.data.meta_title}
                                onChange={(locale, value) =>
                                    form.setData('meta_title', {
                                        ...form.data.meta_title,
                                        [locale]: value,
                                    })
                                }
                                errors={errors}
                                activeLocale={activeSeoLocale}
                            />

                            <TranslationFields
                                fieldName="meta_keywords"
                                label="Meta keywords"
                                value={form.data.meta_keywords}
                                onChange={(locale, value) =>
                                    form.setData('meta_keywords', {
                                        ...form.data.meta_keywords,
                                        [locale]: value,
                                    })
                                }
                                errors={errors}
                                activeLocale={activeSeoLocale}
                            />

                            <TranslationFields
                                fieldName="meta_description"
                                label="Meta description"
                                type="textarea"
                                value={form.data.meta_description}
                                onChange={(locale, value) =>
                                    form.setData('meta_description', {
                                        ...form.data.meta_description,
                                        [locale]: value,
                                    })
                                }
                                errors={errors}
                                activeLocale={activeSeoLocale}
                            />
                        </Card>
                    </>
                )}

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href="/admin/products">Anulează</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Se salvează...' : 'Salvează'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}

function ProductAttributeField({
    attribute,
    value,
    activeLocale,
    onChange,
}: {
    attribute: AttributeDefinition;
    value: AttributeValueInput;
    activeLocale: 'ro' | 'ru';
    onChange: (next: Partial<AttributeValueInput>) => void;
}) {
    return (
        <Card className="space-y-4 p-4">
            <div className="space-y-1">
                <h3 className="font-medium">{localizedText(attribute.name)}</h3>
                {attribute.description?.ro || attribute.description?.ru ? (
                    <p className="text-sm text-muted-foreground">
                        {localizedText(attribute.description)}
                    </p>
                ) : null}
            </div>

            {attribute.type === 'select' ? (
                <select
                    value={value.option_ids?.[0] ?? ''}
                    onChange={(event) =>
                        onChange({
                            option_ids: event.target.value ? [Number(event.target.value)] : [],
                        })
                    }
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                    <option value="">Alege o valoare</option>
                    {attribute.options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {localizedText(option.value)}
                        </option>
                    ))}
                </select>
            ) : null}

            {attribute.type === 'multi_select' ? (
                <div className="grid gap-3 md:grid-cols-2">
                    {attribute.options.map((option) => {
                        const checked = value.option_ids?.includes(option.id) ?? false;

                        return (
                            <label key={option.id} className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) =>
                                        onChange({
                                            option_ids: event.target.checked
                                                ? [...(value.option_ids ?? []), option.id]
                                                : (value.option_ids ?? []).filter((id) => id !== option.id),
                                        })
                                    }
                                />
                                {localizedText(option.value)}
                            </label>
                        );
                    })}
                </div>
            ) : null}

            {attribute.type === 'text' || attribute.type === 'textarea' ? (
                <div className="space-y-2">
                    <Label>{activeLocale === 'ro' ? 'Română' : 'Русский'}</Label>
                    {attribute.type === 'textarea' ? (
                        <textarea
                            value={value.text_value?.[activeLocale] ?? ''}
                            onChange={(event) =>
                                onChange({
                                    text_value: {
                                        ...value.text_value,
                                        [activeLocale]: event.target.value,
                                    },
                                })
                            }
                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        />
                    ) : (
                        <Input
                            value={value.text_value?.[activeLocale] ?? ''}
                            onChange={(event) =>
                                onChange({
                                    text_value: {
                                        ...value.text_value,
                                        [activeLocale]: event.target.value,
                                    },
                                })
                            }
                        />
                    )}
                </div>
            ) : null}

            {attribute.type === 'number' ? (
                <Input
                    type="number"
                    value={value.number_value ?? ''}
                    onChange={(event) => onChange({ number_value: event.target.value })}
                />
            ) : null}

            {attribute.type === 'boolean' ? (
                <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                        type="checkbox"
                        checked={value.boolean_value ?? false}
                        onChange={(event) => onChange({ boolean_value: event.target.checked })}
                    />
                    Da / Nu
                </label>
            ) : null}
        </Card>
    );
}

function flattenCategories(nodes: CategoryNode[], depth = 0): Array<{ id: number; name: Record<string, string>; depth: number }> {
    return nodes.flatMap((node) => [
        { id: node.id, name: node.name, depth },
        ...flattenCategories(node.children, depth + 1),
    ]);
}
