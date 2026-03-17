import { Link } from '@inertiajs/react';
import { Boxes, LayoutGrid, PanelsTopLeft, ReceiptText, Settings, Shapes, Tags } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutGrid,
    },
    {
        title: 'Produse',
        href: '/admin/products',
        icon: Boxes,
    },
    {
        title: 'Categorii',
        href: '/admin/categories',
        icon: PanelsTopLeft,
    },
    {
        title: 'Branduri',
        href: '/admin/brands',
        icon: Tags,
    },
    {
        title: 'Atribute',
        href: '/admin/attributes',
        icon: Shapes,
    },
    {
        title: 'Comenzi',
        href: '/admin/orders',
        icon: ReceiptText,
    },
    {
        title: 'Setări',
        href: '/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Storefront',
        href: 'http://localhost:5173',
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
