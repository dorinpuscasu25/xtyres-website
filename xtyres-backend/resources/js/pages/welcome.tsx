import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="XTyres Admin" />

            <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
                <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur md:p-12">
                    <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">
                                XTyres
                            </p>
                            <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-tight md:text-6xl">
                                Admin pentru catalogul de anvelope si produse auto
                            </h1>
                        </div>

                        <a
                            href="http://localhost:5173"
                            className="inline-flex rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
                        >
                            Deschide storefront
                        </a>
                    </header>

                    <main className="grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-end">
                        <div className="space-y-6">
                            <p className="max-w-2xl text-lg text-slate-300">
                                Adminul gestioneaza produse, branduri,
                                categorii, atribute dinamice si setarile
                                magazinului, in romana si rusa.
                            </p>

                            <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    Categorii cu subcategorii si meniu dinamic
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    Produse cu atribute filtrabile si campuri
                                    flexibile
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    Setari magazin, logo-uri si social media
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                                Acces
                            </p>

                            <div className="mt-6 flex flex-col gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
                                    >
                                        Intra in admin
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
                                    >
                                        Login admin
                                    </Link>
                                )}

                                <a
                                    href="http://localhost:5173"
                                    className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
                                >
                                    Vezi frontendul
                                </a>
                            </div>
                        </div>
                    </main>

                    <footer className="border-t border-white/10 pt-6 text-sm text-slate-400">
                        Laravel + React admin, pregatit pentru ecommerce cu
                        PostgreSQL, traduceri JSON si atribute dinamice.
                    </footer>
                </div>
            </div>
        </>
    );
}
