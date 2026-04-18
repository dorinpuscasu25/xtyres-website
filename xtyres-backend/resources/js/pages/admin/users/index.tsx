import { FormEvent, useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlashMessage } from '@/components/admin/flash-message';
import { Pagination } from '@/components/admin/pagination';
import { PageHeader } from '@/components/admin/page-header';
import InputError from '@/components/input-error';
import { ADMIN_TABLE_PER_PAGE_OPTIONS, usePersistedPageSize } from '@/hooks/use-persisted-page-size';
import type { BreadcrumbItem } from '@/types';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
    is_current_user: boolean;
    can_delete: boolean;
};

type Props = {
    filters: { search: string; per_page: number };
    users: {
        data: AdminUser[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Administratori', href: '/admin/users' },
];

export default function AdminUsersIndex({ filters, users }: Props) {
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [perPage, setPerPage] = useState(String(filters.per_page ?? 25));

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const editingUser = useMemo(
        () => users.data.find((user) => user.id === editingUserId) ?? null,
        [editingUserId, users.data],
    );

    const applyPageSize = usePersistedPageSize('users', filters.per_page ?? 25, (value) => {
        setPerPage(String(value));
        router.get('/admin/users', { search, per_page: value }, { preserveState: true, preserveScroll: true, replace: true });
    });

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();

        createForm.post('/admin/users', {
            onSuccess: () => createForm.reset(),
        });
    };

    const startEditing = (user: AdminUser) => {
        setEditingUserId(user.id);
        editForm.clearErrors();
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
    };

    const cancelEditing = () => {
        setEditingUserId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();

        if (!editingUserId) {
            return;
        }

        editForm.put(`/admin/users/${editingUserId}`, {
            preserveScroll: true,
            onSuccess: () => {
                editForm.reset('password', 'password_confirmation');
            },
        });
    };

    const removeUser = (user: AdminUser) => {
        if (!user.can_delete) {
            return;
        }

        if (!window.confirm(`Sigur vrei să ștergi administratorul ${user.email}?`)) {
            return;
        }

        setDeletingUserId(user.id);

        router.delete(`/admin/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (editingUserId === user.id) {
                    cancelEditing();
                }
            },
            onFinish: () => setDeletingUserId(null),
        });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/users', { search, per_page: Number(perPage) }, { preserveState: true, preserveScroll: true, replace: true });
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

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-6">
                        <Card className="space-y-5 p-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">
                                    Adaugă administrator
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Contul creat va putea intra în sistem cu
                                    email și parolă.
                                </p>
                            </div>

                            <form
                                onSubmit={submitCreate}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nume</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Opțional, de exemplu Ion Popescu"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="admin@xtyres.md"
                                    />
                                    <InputError
                                        message={createForm.errors.email}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Parolă</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Minim 8 caractere"
                                    />
                                    <InputError
                                        message={createForm.errors.password}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirmă parola
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={
                                            createForm.data
                                                .password_confirmation
                                        }
                                        onChange={(event) =>
                                            createForm.setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Reintrodu parola"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                >
                                    {createForm.processing
                                        ? 'Se adaugă...'
                                        : 'Adaugă administrator'}
                                </Button>
                            </form>
                        </Card>

                        <Card className="space-y-5 p-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">
                                    {editingUser
                                        ? `Editează: ${editingUser.email}`
                                        : 'Editează administrator'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Selectează un administrator din listă ca să
                                    îi schimbi emailul sau parola.
                                </p>
                            </div>

                            {editingUser ? (
                                <form onSubmit={submitEdit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">Nume</Label>
                                        <Input
                                            id="edit-name"
                                            value={editForm.data.name}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Numele administratorului"
                                        />
                                        <InputError
                                            message={editForm.errors.name}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-email">Email</Label>
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="admin@xtyres.md"
                                        />
                                        <InputError
                                            message={editForm.errors.email}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password">
                                            Parolă nouă
                                        </Label>
                                        <Input
                                            id="edit-password"
                                            type="password"
                                            value={editForm.data.password}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'password',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Lasă gol dacă nu vrei să o schimbi"
                                        />
                                        <InputError
                                            message={editForm.errors.password}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password_confirmation">
                                            Confirmă parola nouă
                                        </Label>
                                        <Input
                                            id="edit-password_confirmation"
                                            type="password"
                                            value={
                                                editForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'password_confirmation',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Completează doar dacă schimbi parola"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            type="submit"
                                            disabled={editForm.processing}
                                        >
                                            {editForm.processing
                                                ? 'Se salvează...'
                                                : 'Salvează modificările'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={cancelEditing}
                                        >
                                            Renunță
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                                    Apasă pe butonul „Editează” din dreptul unui
                                    administrator ca să îi modifici datele.
                                </div>
                            )}
                        </Card>
                    </div>

                    <Card className="overflow-hidden">
                        <div className="space-y-4 border-b border-border px-6 py-4">
                            <h2 className="text-lg font-semibold">
                                Lista administratorilor
                            </h2>
                            <form
                                onSubmit={submitSearch}
                                className="flex flex-col gap-3 md:flex-row"
                            >
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Caută după nume sau email"
                                />
                                <select
                                    value={perPage}
                                    onChange={(event) => {
                                        setPerPage(event.target.value);
                                        applyPageSize(
                                            Number(event.target.value),
                                        );
                                    }}
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                                >
                                    {ADMIN_TABLE_PER_PAGE_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option} / pagină
                                            </option>
                                        ),
                                    )}
                                </select>
                                <Button type="submit">Caută</Button>
                            </form>
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
                                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                            Acțiuni
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
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
                                                    {user.is_current_user ? (
                                                        <span className="ml-2 inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                                                            Tu
                                                        </span>
                                                    ) : null}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                startEditing(
                                                                    user,
                                                                )
                                                            }
                                                        >
                                                            Editează
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            disabled={
                                                                !user.can_delete ||
                                                                deletingUserId ===
                                                                    user.id
                                                            }
                                                            onClick={() =>
                                                                removeUser(user)
                                                            }
                                                        >
                                                            {deletingUserId ===
                                                            user.id
                                                                ? 'Se șterge...'
                                                                : 'Șterge'}
                                                        </Button>
                                                    </div>
                                                    {!user.can_delete ? (
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            {user.is_current_user
                                                                ? 'Contul tău nu poate fi șters din această pagină.'
                                                                : 'Trebuie să rămână cel puțin un administrator activ.'}
                                                        </p>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
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

                        <div className="border-t border-border px-6 py-4">
                            <Pagination links={users.links} />
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
