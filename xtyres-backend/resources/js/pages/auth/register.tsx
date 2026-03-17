import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

export default function Register() {
    return (
        <AuthLayout
            title="Registration disabled"
            description="Administrator accounts are managed internally for this store."
        >
            <Head title="Registration disabled" />

            <div className="space-y-6 text-center">
                <p className="text-sm text-muted-foreground">
                    If you need access to the administration area, ask an
                    existing administrator to create your account.
                </p>

                <TextLink
                    href={login()}
                    className="inline-flex w-full items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium no-underline"
                >
                    Back to login
                </TextLink>
            </div>
        </AuthLayout>
    );
}
