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
import { localizedText } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type AttributeInfo = {
    id: number;
    name: Record<string, string>;
    slug: Record<string, string>;
    type: string;
};

type OptionFormData = {
    id?: number;
    value: Record<string, string>;
    sort_order: number;
    is_active: boolean;
    _method?: 'put';
};

type Props = {
    mode: 'create' | 'edit';
    attribute: AttributeInfo;
    option: Omit<OptionFormData, '_method'>;
};

export default function AttributeOptionForm({ mode, attribute, option }: Props) {
    const [activeLocale, setActiveLocale] = useState<'ro' | 'ru'>('ro');
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

    const form = useForm<OptionFormData>({
        ...option,
        _method: mode === 'edit' ? 'put' : undefined,
    });
    const errors = form.errors as Record<string, string>;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const url =
            mode === 'create'
                ? `/admin/attributes/${attribute.id}/options`
                : `/admin/attributes/${attribute.id}/options/${option.id}`;

        form.post(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mode === 'create' ? 'Adaugă opțiune' : 'Editează opțiune'} />

            <form onSubmit={submit} className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title={mode === 'create' ? 'Adaugă opțiune' : 'Editează opțiune'}
                    description={`Atribut: ${localizedText(attribute.name)}`}
                    actions={
                        <Button asChild variant="outline">
                            <Link href={`/admin/attributes/${attribute.id}/options`}>
                                Înapoi la opțiuni
                            </Link>
                        </Button>
                    }
                />

                <Card className="p-4">
                    <TranslationLocaleTabs value={activeLocale} onChange={setActiveLocale} />
                </Card>

                <Card className="space-y-6 p-6">
                    <TranslationFields
                        fieldName="value"
                        label="Valoare"
                        value={form.data.value}
                        onChange={(locale, value) =>
                            form.setData('value', { ...form.data.value, [locale]: value })
                        }
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
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

                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(event) =>
                                form.setData('is_active', event.target.checked)
                            }
                        />
                        Opțiune activă
                    </label>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button asChild variant="outline">
                        <Link href={`/admin/attributes/${attribute.id}/options`}>
                            Anulează
                        </Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Se salvează...' : 'Salvează'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
