import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type PageProps } from '@/types'; // Import your updated PageProps
import { Link, usePage } from '@inertiajs/react';
import {
    Folder,
    LayoutGrid,
    Settings2,
    BookOpen,
    DoorOpen,
    CalendarDays,
    ClipboardList,
    CalendarRange,
    UsersIcon,
    UserSquare,
    FileText,
    UserMinus,
    ListChecks,
    Network,
} from 'lucide-react';
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
            title: translations?.salles_nav_item || 'Salles',
            href: route('admin.salles.index'),
            icon: DoorOpen, 
            active: route().current('admin.salles.*'),
        });
        mainNavItems.push({
            title: translations?.annee_uni_nav_item || 'Academic Years',
            href: route('admin.annees-universitaires.index'), 
            icon: CalendarDays, 
            active: route().current('admin.annees-universitaires.*'),
        });
        mainNavItems.push({
            title: translations?.sesons_nav_item || 'Sessions',
            href: route('admin.sesons.index'), 
            icon: ClipboardList, 
            active: route().current('admin.sesons.*'),
        });
        mainNavItems.push({
            title: translations?.quadrimestres_nav_item || 'Semesters', 
            href: route('admin.quadrimestres.index'), 
            icon: CalendarRange, 
            active: route().current('admin.quadrimestres.*'),
        });
        mainNavItems.push({
            title: translations?.users_nav_item || 'Users',
            href: route('admin.users.index'), 
            icon: UsersIcon, 
            active: route().current('admin.users.*'),
        });
        mainNavItems.push({
            title: translations?.professeurs_nav_item || 'Professors',
            href: route('admin.professeurs.index'),
            icon: UserSquare, 
            active: route().current('admin.professeurs.*'),
        });
        mainNavItems.push({
            title: translations?.examens_nav_item || 'Examinations',
            href: route('admin.examens.index'),
            icon: FileText,
            active: route().current('admin.examens.*'),
        });
        mainNavItems.push({
            title: translations?.attributions_nav_item || 'Assignments',
            href: route('admin.attributions.index'), 
            icon: ListChecks, 
            active: route().current('admin.attributions.index'), // Only one route for now
        });
        mainNavItems.push({
            title: translations?.filieres_nav_item || 'Study Fields',
            href: route('admin.filieres.index'),
            icon: Network,
            active: route().current('admin.filieres.*'),
        });

    }
    if (auth.user && auth.abilities?.is_admin_or_rh) {
        mainNavItems.push({
            title: translations?.unavailabilities_nav_item || 'Prof. Unavailabilities',
            href: route('admin.unavailabilities.index'), 
            icon: UserMinus, 
            active: route().current('admin.unavailabilities.*'),
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
