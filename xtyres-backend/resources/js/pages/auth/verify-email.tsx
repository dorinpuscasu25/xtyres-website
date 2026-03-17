// Components
import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';

export default function VerifyEmail() {
    const logoutRoute = logout();

    return (
        <AuthLayout
            title="Email verification disabled"
            description="This administration area does not require email verification."
        >
            <Head title="Email verification disabled" />

            <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                    You can sign out and go back to the login page if needed.
                </p>
            </div>

            <Form
                action={logoutRoute.url}
                method={logoutRoute.method}
                className="space-y-6 text-center"
            >
                {({ processing }) => (
                    <Button disabled={processing} variant="secondary">
                        {processing ? 'Logging out...' : 'Log out'}
                    </Button>
                )}
            </Form>
        </AuthLayout>
    );
}
