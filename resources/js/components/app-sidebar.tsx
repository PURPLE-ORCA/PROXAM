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
    RefreshCw, // Added for Exchanges
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

    const mainNavItems: NavItem[] = []; // Start with an empty array

    // Determine the correct dashboard link based on role
    let dashboardHref = route('dashboard'); // Default (e.g., for admin)
    let dashboardTitle = translations?.dashboard_nav_item || 'Dashboard';
    let dashboardIcon = Settings2; // Default icon

    if (auth.user && auth.abilities?.is_professeur) {
        dashboardHref = route('professeur.dashboard');
        dashboardTitle = translations?.professor_dashboard_nav_item || 'My Dashboard'; // Use a distinct title if possible
        dashboardIcon = LayoutGrid; // Or a different icon for prof dashboard
    }
    // Add other roles here if they have specific dashboards (e.g., RH, Chef de Service)
    // else if (auth.user && auth.abilities?.is_rh) { ... }

    mainNavItems.push({
        title: dashboardTitle,
        href: dashboardHref,
        icon: dashboardIcon,
        active: route().current(dashboardHref.substring(dashboardHref.lastIndexOf('/') + 1) + '*') || route().current('dashboard') || route().current('professeur.dashboard'), // More robust active check
    });


    // Conditionally add admin links (ONLY if not a professor, or if admin can also be professor but has a distinct admin section)
    // Assuming admin view is distinct from professor view:
    if (auth.user && auth.abilities?.is_admin /* && !auth.abilities?.is_professeur */) { // Add !auth.abilities?.is_professeur if an admin should NOT see prof links
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
            active: route().current('admin.attributions.index'), 
        });
        mainNavItems.push({
            title: translations?.filieres_nav_item || 'Study Fields',
            href: route('admin.filieres.index'),
            icon: Network,
            active: route().current('admin.filieres.*'),
        });
    }

    // Professor-specific links (excluding their dashboard which is now the primary one)
    if (auth.user && auth.abilities?.is_professeur) {
        mainNavItems.push({
            title: translations?.my_schedule_nav_item || 'My Schedule',
            href: route('professeur.schedule.index'),
            icon: CalendarDays,
            active: route().current('professeur.schedule.index'),
        });
        mainNavItems.push({
            title: translations?.my_unavailabilities_nav_item || 'My Unavailabilities',
            href: route('professeur.unavailabilities.index'),
            icon: UserMinus,
            active: route().current('professeur.unavailabilities.index'),
        });
        mainNavItems.push({
            title: translations?.exchanges_nav_item || 'Exchanges',
            href: route('professeur.exchanges.index'),
            icon: RefreshCw,
            active: route().current('professeur.exchanges.*'),
        });
    }

    // Admin or RH specific links (like Admin Unavailabilities Management)
    if (auth.user && auth.abilities?.is_admin_or_rh) {
        // Avoid adding if it's a professor and they already have "My Unavailabilities"
        // Or ensure the title/route is distinct (e.g., "Manage Unavailabilities")
        if (!mainNavItems.some(item => item.href === route('admin.unavailabilities.index'))) { // Avoid duplicate if admin is also RH
             mainNavItems.push({
                title: translations?.unavailabilities_nav_item || 'Prof. Unavailabilities', // This is the ADMIN management link
                href: route('admin.unavailabilities.index'),
                icon: UserMinus,
                active: route().current('admin.unavailabilities.*'),
            });
        }
    }

    // Filter out duplicates just in case (based on href, more robust)
    const uniqueMainNavItems = mainNavItems.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.href === item.href && t.title === item.title // Could also just use href if titles are guaranteed unique per href
        ))
    );

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
                <NavMain items={uniqueMainNavItems} /> {/* Use unique items */}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
