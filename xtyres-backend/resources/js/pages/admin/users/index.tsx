import { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlashMessage } from '@/components/admin/flash-message';
import { PageHeader } from '@/components/admin/page-header';
import InputError from '@/components/input-error';
import type { BreadcrumbItem } from '@/types';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
};

type Props = {
    users: AdminUser[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Administratori', href: '/admin/users' },
];

export default function AdminUsersIndex({ users }: Props) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/admin/users', {
            onSuccess: () => form.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administratori" />

            <div className="space-y-6 p-4">
                <FlashMessage />

                <PageHeader
                    title="Administratori"
                    description="Adaugă conturi noi de admin și vezi rapid cine are acces la panoul de administrare."
                />

                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <Card className="space-y-5 p-6">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold">
                                Adaugă administrator
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Contul creat va putea intra în sistem cu email
                                și parolă.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nume</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Opțional, de exemplu Ion Popescu"
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="admin@xtyres.md"
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Parolă</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Minim 8 caractere"
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmă parola
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Reintrodu parola"
                                />
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Se adaugă...'
                                    : 'Adaugă administrator'}
                            </Button>
                        </form>
                    </Card>

                    <Card className="overflow-hidden">
                        <div className="border-b border-border px-6 py-4">
                            <h2 className="text-lg font-semibold">
                                Lista administratorilor
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Nume
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Creat la
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Rol
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-border"
                                            >
                                                <td className="px-6 py-4 font-medium">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {user.created_at ?? '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                        Administrator
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-muted-foreground"
                                            >
                                                Nu există încă alți
                                                administratori înregistrați.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
