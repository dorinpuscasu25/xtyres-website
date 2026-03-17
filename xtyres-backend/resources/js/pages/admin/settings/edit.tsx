import { ChangeEvent, FormEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
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

type SocialLink = {
    name: string;
    url: string;
};

type SettingsFormData = {
    site_name: Record<string, string>;
    site_description: Record<string, string>;
    footer_text: Record<string, string>;
    contact_address: Record<string, string>;
    working_hours: Record<string, string>;
    emails: string[];
    phones: string[];
    social_links: SocialLink[];
    map_embed_url: string;
    header_logo_url: string | null;
    footer_logo_url: string | null;
    header_logo: File | null;
    footer_logo: File | null;
    remove_header_logo: boolean;
    remove_footer_logo: boolean;
    _method?: 'put';
};

type Props = {
    settings: Omit<SettingsFormData, 'header_logo' | 'footer_logo'>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Setări', href: '/admin/settings' },
];

export default function SettingsEdit({ settings }: Props) {
    const [activeLocale, setActiveLocale] = useState<'ro' | 'ru'>('ro');
    const [headerPreview, setHeaderPreview] = useState<string | null>(settings.header_logo_url);
    const [footerPreview, setFooterPreview] = useState<string | null>(settings.footer_logo_url);
    const form = useForm<SettingsFormData>({
        ...settings,
        header_logo: null,
        footer_logo: null,
        _method: 'put',
    });
    const errors = form.errors as Record<string, string>;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/admin/settings', { forceFormData: true });
    };

    const updateArrayValue = (field: 'emails' | 'phones', index: number, value: string) => {
        form.setData(
            field,
            form.data[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
        );
    };

    const onFileChange = (field: 'header_logo' | 'footer_logo') => (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData(field, file);

        if (field === 'header_logo') {
            form.setData('remove_header_logo', false);
            setHeaderPreview(file ? URL.createObjectURL(file) : settings.header_logo_url);
        } else {
            form.setData('remove_footer_logo', false);
            setFooterPreview(file ? URL.createObjectURL(file) : settings.footer_logo_url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Setări" />

            <form onSubmit={submit} className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Setări magazin"
                    description="Date de contact, social media și identitatea vizuală afișată în frontend."
                />

                <Card className="p-4">
                    <TranslationLocaleTabs value={activeLocale} onChange={setActiveLocale} />
                </Card>

                <Card className="space-y-6 p-6">
                    <TranslationFields
                        fieldName="site_name"
                        label="Nume magazin"
                        value={form.data.site_name}
                        onChange={(locale, value) =>
                            form.setData('site_name', { ...form.data.site_name, [locale]: value })
                        }
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <TranslationFields
                        fieldName="site_description"
                        label="Descriere site"
                        type="textarea"
                        value={form.data.site_description}
                        onChange={(locale, value) =>
                            form.setData('site_description', { ...form.data.site_description, [locale]: value })
                        }
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <TranslationFields
                        fieldName="footer_text"
                        label="Text footer"
                        type="textarea"
                        value={form.data.footer_text}
                        onChange={(locale, value) =>
                            form.setData('footer_text', { ...form.data.footer_text, [locale]: value })
                        }
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <TranslationFields
                        fieldName="contact_address"
                        label="Adresă"
                        value={form.data.contact_address}
                        onChange={(locale, value) =>
                            form.setData('contact_address', { ...form.data.contact_address, [locale]: value })
                        }
                        errors={errors}
                        activeLocale={activeLocale}
                    />

                    <TranslationFields
                        fieldName="working_hours"
                        label="Program"
                        value={form.data.working_hours}
                        onChange={(locale, value) =>
                            form.setData('working_hours', { ...form.data.working_hours, [locale]: value })
                        }
                        errors={errors}
                        activeLocale={activeLocale}
                    />
                </Card>

                <Card className="space-y-6 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Emailuri</Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.setData('emails', [...form.data.emails, ''])}
                            >
                                Adaugă email
                            </Button>
                        </div>
                        {form.data.emails.map((email, index) => (
                            <div key={`email-${index}`} className="flex gap-3">
                                <Input value={email} onChange={(event) => updateArrayValue('emails', index, event.target.value)} />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() =>
                                        form.setData(
                                            'emails',
                                            form.data.emails.filter((_, emailIndex) => emailIndex !== index),
                                        )
                                    }
                                >
                                    Șterge
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Telefoane</Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.setData('phones', [...form.data.phones, ''])}
                            >
                                Adaugă telefon
                            </Button>
                        </div>
                        {form.data.phones.map((phone, index) => (
                            <div key={`phone-${index}`} className="flex gap-3">
                                <Input value={phone} onChange={(event) => updateArrayValue('phones', index, event.target.value)} />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() =>
                                        form.setData(
                                            'phones',
                                            form.data.phones.filter((_, phoneIndex) => phoneIndex !== index),
                                        )
                                    }
                                >
                                    Șterge
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Social media</Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    form.setData('social_links', [...form.data.social_links, { name: '', url: '' }])
                                }
                            >
                                Adaugă rețea
                            </Button>
                        </div>
                        {form.data.social_links.map((item, index) => (
                            <div key={`social-${index}`} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                                <Input
                                    value={item.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'social_links',
                                            form.data.social_links.map((link, linkIndex) =>
                                                linkIndex === index ? { ...link, name: event.target.value } : link,
                                            ),
                                        )
                                    }
                                    placeholder="facebook"
                                />
                                <Input
                                    value={item.url}
                                    onChange={(event) =>
                                        form.setData(
                                            'social_links',
                                            form.data.social_links.map((link, linkIndex) =>
                                                linkIndex === index ? { ...link, url: event.target.value } : link,
                                            ),
                                        )
                                    }
                                    placeholder="https://facebook.com/xtyres"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() =>
                                        form.setData(
                                            'social_links',
                                            form.data.social_links.filter((_, linkIndex) => linkIndex !== index),
                                        )
                                    }
                                >
                                    Șterge
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="map_embed_url">Google Maps / URL hartă</Label>
                        <Input
                            id="map_embed_url"
                            value={form.data.map_embed_url}
                            onChange={(event) => form.setData('map_embed_url', event.target.value)}
                        />
                    </div>
                </Card>

                <Card className="grid gap-6 p-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <Label htmlFor="header_logo">Logo header</Label>
                        <Input id="header_logo" type="file" accept="image/*" onChange={onFileChange('header_logo')} />
                        {headerPreview ? (
                            <img src={headerPreview} alt="Header logo" className="h-24 rounded-xl border border-border object-cover" />
                        ) : null}
                        {settings.header_logo_url ? (
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={form.data.remove_header_logo}
                                    onChange={(event) => form.setData('remove_header_logo', event.target.checked)}
                                />
                                Șterge logo header
                            </label>
                        ) : null}
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="footer_logo">Logo footer</Label>
                        <Input id="footer_logo" type="file" accept="image/*" onChange={onFileChange('footer_logo')} />
                        {footerPreview ? (
                            <img src={footerPreview} alt="Footer logo" className="h-24 rounded-xl border border-border object-cover" />
                        ) : null}
                        {settings.footer_logo_url ? (
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={form.data.remove_footer_logo}
                                    onChange={(event) => form.setData('remove_footer_logo', event.target.checked)}
                                />
                                Șterge logo footer
                            </label>
                        ) : null}
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Se salvează...' : 'Salvează setările'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
