import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type PageProps } from '@/types'; // Import your updated PageProps
import { Link, usePage } from '@inertiajs/react';
import { Folder, LayoutGrid, Settings2, BookOpen } from 'lucide-react';
import AppLogo from './app-logo';
import React, { useContext } from 'react'; // Added useContext
import { TranslationContext } from '@/context/TranslationProvider';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/PURPLE-ORCA/PROFS2EXAMS',
        icon: Folder,
    },
];

export function AppSidebar() {
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage<PageProps>().props;

    const mainNavItems: NavItem[] = [
        {
            title: translations?.dashboard_nav_item || 'Dashboard',
            href: route('dashboard'), // Use Ziggy for route names
            icon: Settings2,
        },
    ];

    // Conditionally add admin links
    if (auth.user && auth.abilities?.is_admin) {
        mainNavItems.push({
            title: translations?.services_nav_item || 'Services',
            href: route('admin.services.index'),
            icon: LayoutGrid,
            active: route().current('admin.services.*'),
        });
        mainNavItems.push({
            title: translations?.modules_nav_item || 'Modules',
            href: route('admin.modules.index'),
            icon: BookOpen, // Example icon for Modules
            active: route().current('admin.modules.*'),
        });

    }
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
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
