import { ChangeEvent, FormEvent, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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

type CategoryFormData = {
    id?: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    description: Record<string, string>;
    parent_id: number | null;
    icon: string;
    image_url: string | null;
    image: File | null;
    remove_image: boolean;
    is_active: boolean;
    is_featured: boolean;
    menu_order: number;
    _method?: 'put';
};

type Props = {
    mode: 'create' | 'edit';
    category: Omit<CategoryFormData, 'image'>;
    categoryTree: CategoryNode[];
};

export default function CategoryForm({ mode, category, categoryTree }: Props) {
    const [activeLocale, setActiveLocale] = useState<'ro' | 'ru'>('ro');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Categorii', href: '/admin/categories' },
        {
            title: mode === 'create' ? 'Adaugă categorie' : 'Editează categorie',
            href: mode === 'create' ? '/admin/categories/create' : `/admin/categories/${category.id}/edit`,
        },
    ];

    const [preview, setPreview] = useState<string | null>(category.image_url);
    const form = useForm<CategoryFormData>({
        ...category,
        image: null,
        _method: mode === 'edit' ? 'put' : undefined,
    });
    const errors = form.errors as Record<string, string>;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const url = mode === 'create' ? '/admin/categories' : `/admin/categories/${category.id}`;
        form.post(url, { forceFormData: true });
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('image', file);
        form.setData('remove_image', false);
        setPreview(file ? URL.createObjectURL(file) : category.image_url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mode === 'create' ? 'Adaugă categorie' : 'Editează categorie'} />

            <form onSubmit={submit} className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title={mode === 'create' ? 'Adaugă categorie' : 'Editează categorie'}
                    description="Poți alege un părinte pentru a construi structura de subcategorii."
                    actions={
                        <Button asChild variant="outline">
                            <Link href="/admin/categories">Înapoi la listă</Link>
                        </Button>
                    }
                />

                <Card className="p-4">
                    <TranslationLocaleTabs value={activeLocale} onChange={setActiveLocale} />
                </Card>

                <Card className="space-y-6 p-6">
                    <TranslationFields
                        fieldName="name"
                        label="Nume"
                        value={form.data.name}
                        onChange={(locale, value) => form.setData('name', { ...form.data.name, [locale]: value })}
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <TranslationFields
                        fieldName="slug"
                        label="Slug"
                        value={form.data.slug}
                        onChange={(locale, value) => form.setData('slug', { ...form.data.slug, [locale]: value })}
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <TranslationFields
                        fieldName="description"
                        label="Descriere"
                        type="textarea"
                        value={form.data.description}
                        onChange={(locale, value) =>
                            form.setData('description', { ...form.data.description, [locale]: value })
                        }
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                            <Input
                                id="icon"
                                value={form.data.icon}
                                onChange={(event) => form.setData('icon', event.target.value)}
                                placeholder="ex: tire"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="menu_order">Ordine meniu</Label>
                            <Input
                                id="menu_order"
                                type="number"
                                value={form.data.menu_order}
                                onChange={(event) => form.setData('menu_order', Number(event.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Categorie părinte</Label>
                        <div className="space-y-2 rounded-xl border border-border p-4">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="radio"
                                    checked={form.data.parent_id === null}
                                    onChange={() => form.setData('parent_id', null)}
                                />
                                Fără părinte
                            </label>

                            <div className="space-y-3">
                                {categoryTree.map((node) => (
                                    <CategoryParentNode
                                        key={node.id}
                                        node={node}
                                        selectedId={form.data.parent_id}
                                        onSelect={(id) => form.setData('parent_id', id)}
                                    />
                                ))}
                            </div>
                        </div>
                        {errors.parent_id ? <p className="text-sm text-red-600">{errors.parent_id}</p> : null}
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="image">Imagine categorie</Label>
                        <Input id="image" type="file" accept="image/*" onChange={onFileChange} />
                        {preview ? (
                            <img
                                src={preview}
                                alt="Category preview"
                                className="h-28 rounded-xl border border-border object-cover"
                            />
                        ) : null}
                        {category.image_url ? (
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={form.data.remove_image}
                                    onChange={(event) => form.setData('remove_image', event.target.checked)}
                                />
                                Șterge imaginea curentă
                            </label>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                            />
                            Categorie activă
                        </label>

                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_featured}
                                onChange={(event) => form.setData('is_featured', event.target.checked)}
                            />
                            Evidențiază pe homepage
                        </label>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href="/admin/categories">Anulează</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Se salvează...' : 'Salvează'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}

function CategoryParentNode({
    node,
    selectedId,
    onSelect,
    depth = 0,
}: {
    node: CategoryNode;
    selectedId: number | null;
    onSelect: (id: number) => void;
    depth?: number;
}) {
    return (
        <div className="space-y-2">
            <label
                className="flex items-center gap-2 text-sm font-medium"
                style={{ paddingLeft: `${depth * 14}px` }}
            >
                <input
                    type="radio"
                    checked={selectedId === node.id}
                    onChange={() => onSelect(node.id)}
                />
                {localizedText(node.name)}
            </label>

            {node.children.map((child) => (
                <CategoryParentNode
                    key={child.id}
                    node={child}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
}
