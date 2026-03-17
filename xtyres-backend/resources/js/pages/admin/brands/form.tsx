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
import type { BreadcrumbItem } from '@/types';

type BrandFormData = {
    id?: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    description: Record<string, string>;
    website_url: string;
    logo_url: string | null;
    logo: File | null;
    remove_logo: boolean;
    is_active: boolean;
    sort_order: number;
    _method?: 'put';
};

type Props = {
    mode: 'create' | 'edit';
    brand: Omit<BrandFormData, 'logo'>;
};

export default function BrandForm({ mode, brand }: Props) {
    const [activeLocale, setActiveLocale] = useState<'ro' | 'ru'>('ro');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Branduri', href: '/admin/brands' },
        {
            title: mode === 'create' ? 'Adaugă brand' : 'Editează brand',
            href: mode === 'create' ? '/admin/brands/create' : `/admin/brands/${brand.id}/edit`,
        },
    ];

    const [preview, setPreview] = useState<string | null>(brand.logo_url);
    const form = useForm<BrandFormData>({
        ...brand,
        logo: null,
        _method: mode === 'edit' ? 'put' : undefined,
    });

    const errors = form.errors as Record<string, string>;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const url = mode === 'create' ? '/admin/brands' : `/admin/brands/${brand.id}`;
        form.post(url, { forceFormData: true });
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('logo', file);
        form.setData('remove_logo', false);
        setPreview(file ? URL.createObjectURL(file) : brand.logo_url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mode === 'create' ? 'Adaugă brand' : 'Editează brand'} />

            <form onSubmit={submit} className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title={mode === 'create' ? 'Adaugă brand' : 'Editează brand'}
                    description="Fiecare brand poate avea logo, descriere și URL oficial."
                    actions={
                        <Button asChild variant="outline">
                            <Link href="/admin/brands">Înapoi la listă</Link>
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
                            <Label htmlFor="website_url">Website</Label>
                            <Input
                                id="website_url"
                                value={form.data.website_url}
                                onChange={(event) => form.setData('website_url', event.target.value)}
                                placeholder="https://brand.com"
                            />
                            {errors.website_url ? (
                                <p className="text-sm text-red-600">{errors.website_url}</p>
                            ) : null}
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

                    <div className="space-y-3">
                        <Label htmlFor="logo">Logo</Label>
                        <Input id="logo" type="file" accept="image/*" onChange={onFileChange} />
                        {preview ? (
                            <img src={preview} alt="Logo preview" className="h-24 rounded-xl border border-border object-cover" />
                        ) : null}
                        {brand.logo_url ? (
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={form.data.remove_logo}
                                    onChange={(event) => form.setData('remove_logo', event.target.checked)}
                                />
                                Șterge logo-ul curent
                            </label>
                        ) : null}
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(event) => form.setData('is_active', event.target.checked)}
                        />
                        Brand activ
                    </label>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href="/admin/brands">Anulează</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Se salvează...' : 'Salvează'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
