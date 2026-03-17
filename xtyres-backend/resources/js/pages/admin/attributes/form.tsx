import { FormEvent, useState } from 'react';
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
import type { BreadcrumbItem } from '@/types';

type CategoryNode = {
    id: number;
    name: Record<string, string>;
    children: CategoryNode[];
};

type AttributeFormData = {
    id?: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    description: Record<string, string>;
    type: string;
    is_filterable: boolean;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    category_ids: number[];
    _method?: 'put';
};

type Props = {
    mode: 'create' | 'edit';
    attribute: Omit<AttributeFormData, '_method'>;
    categoryTree: CategoryNode[];
    attributeTypes: Array<{ value: string; label: string }>;
};

export default function AttributeForm({
    mode,
    attribute,
    categoryTree,
    attributeTypes,
}: Props) {
    const [activeLocale, setActiveLocale] = useState<'ro' | 'ru'>('ro');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Atribute', href: '/admin/attributes' },
        {
            title: mode === 'create' ? 'Adaugă atribut' : 'Editează atribut',
            href: mode === 'create' ? '/admin/attributes/create' : `/admin/attributes/${attribute.id}/edit`,
        },
    ];

    const form = useForm<AttributeFormData>({
        ...attribute,
        _method: mode === 'edit' ? 'put' : undefined,
    });

    const errors = form.errors as Record<string, string>;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const url = mode === 'create' ? '/admin/attributes' : `/admin/attributes/${attribute.id}`;
        form.post(url);
    };

    const toggleCategory = (id: number) => {
        form.setData(
            'category_ids',
            form.data.category_ids.includes(id)
                ? form.data.category_ids.filter((value) => value !== id)
                : [...form.data.category_ids, id],
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mode === 'create' ? 'Adaugă atribut' : 'Editează atribut'} />

            <form onSubmit={submit} className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title={mode === 'create' ? 'Adaugă atribut' : 'Editează atribut'}
                    description="Definește tipul atributului și categoriile în care va fi disponibil."
                    actions={
                        <div className="flex gap-2">
                            {mode === 'edit' && ['select', 'multi_select'].includes(form.data.type) ? (
                                <Button asChild variant="outline">
                                    <Link href={`/admin/attributes/${attribute.id}/options`}>
                                        Gestionează opțiuni
                                    </Link>
                                </Button>
                            ) : null}
                            <Button asChild variant="outline">
                                <Link href="/admin/attributes">Înapoi la listă</Link>
                            </Button>
                        </div>
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

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tip atribut</Label>
                            <select
                                id="type"
                                value={form.data.type}
                                onChange={(event) => form.setData('type', event.target.value)}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                                {attributeTypes.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Ordine</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={form.data.sort_order}
                                onChange={(event) => form.setData('sort_order', Number(event.target.value))}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_filterable}
                                onChange={(event) => form.setData('is_filterable', event.target.checked)}
                            />
                            Intră în filtre
                        </label>

                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_required}
                                onChange={(event) => form.setData('is_required', event.target.checked)}
                            />
                            Obligatoriu la produs
                        </label>

                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                            />
                            Atribut activ
                        </label>
                    </div>

                    <div className="space-y-3">
                        <Label>Categorii</Label>
                        <CategoryTreeSelector
                            nodes={categoryTree}
                            selectedIds={form.data.category_ids}
                            onToggle={toggleCategory}
                        />
                        {errors.category_ids ? <p className="text-sm text-red-600">{errors.category_ids}</p> : null}
                    </div>

                    {['select', 'multi_select'].includes(form.data.type) ? (
                        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            Salvează atributul, apoi intră în pagina de opțiuni ca să adaugi valorile disponibile.
                        </div>
                    ) : null}
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href="/admin/attributes">Anulează</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Se salvează...' : 'Salvează'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
