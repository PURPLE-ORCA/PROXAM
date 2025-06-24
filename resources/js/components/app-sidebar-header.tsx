import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem as BreadcrumbItemType, type PageProps } from '@/types';
import { Icon } from '@iconify/react';
import { Link, usePage } from '@inertiajs/react';
import NotificationBadge from './NotificationBadge';
import LanguageSwitcher from './Layout/Controls/LanguageSwitcher';

// Define an interface to extend PageProps with translations
interface AppSidebarHeaderPageProps extends PageProps {
    translations: {
        back_to_control_center?: string;
        // Add other translation keys as needed if they are used in this component
    };
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth, translations } = usePage<AppSidebarHeaderPageProps>().props;
    const user = auth.user;

    // First, determine if the current user is one who would even use the Control Center.
    const userCanSeeControlCenter = auth.abilities?.is_admin || auth.abilities?.is_rh || auth.abilities?.is_chef_service;

    // Now, determine if we should show the back button.
    // Show it if the user CAN see the control center, but is NOT currently on it.
    const showBackButton = userCanSeeControlCenter && route().current() !== 'control-center';

    const getInitials = (name: string): string => {
        if (!name) return '';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <header className="border-sidebar-border/50 bg-background flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-2">
                {showBackButton ? (
                    <Link href={route('control-center')}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-[var(--fmpo)]">
                            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
                            {translations?.back_to_control_center || 'Control Center'}
                        </Button>
                    </Link>
                ) : (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                )}
            </div>

            <div className="flex flex-1 items-center justify-end gap-1.5 md:gap-2">
                <LanguageSwitcher />
                <NotificationBadge />
            </div>
        </header>
    );
}
