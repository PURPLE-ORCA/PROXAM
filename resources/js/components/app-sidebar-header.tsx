import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TranslationContext } from '@/context/TranslationProvider';
import { type BreadcrumbItem as BreadcrumbItemType, type PageProps } from '@/types';
import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react';
import { useContext } from 'react';
import NotificationBadge from './NotificationBadge';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth, academicYear, ziggy } = usePage<PageProps>().props;
    const user = auth.user;
    const { translations, switchLanguage } = useContext(TranslationContext);
    const currentUiLang = localStorage.getItem('lang') || 'en';

    // --- NEW LOGIC ---
    // First, determine if the current user is one who would even use the Control Center.
    const userCanSeeControlCenter = auth.abilities?.is_admin || auth.abilities?.is_rh || auth.abilities?.is_chef_service;

    // Now, determine if we should show the back button.
    // Show it if the user CAN see the control center, but is NOT currently on it.
    const showBackButton = userCanSeeControlCenter && route().current() !== 'control-center';
    // --- END NEW LOGIC ---

    const locals = [
        { locale: 'en', label: translations?.language_english || 'English' },
        { locale: 'fr', label: translations?.language_french || 'Français' },
        { locale: 'ar', label: translations?.language_arabic || 'العربية' },
    ];

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
                            <Icon icon="mdi:arrow-left" className="h-4 w-4 " />
                            {translations?.back_to_control_center || 'Control Center'}
                        </Button>
                    </Link>
                ) : (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                )}
            </div>

            <div className="flex flex-1 items-center justify-end gap-1.5 md:gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <Icon icon="fa-solid:language" className="h-4 w-4 text-[var(--fmpo)]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                        {locals.map((loc) => (
                            <DropdownMenuItem
                                key={loc.locale}
                                onClick={() => switchLanguage(loc.locale)}
                                className={`flex items-center justify-between data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[var(--accent-foreground)] ${loc.locale === 'ar' ? 'font-arabic flex-row-reverse justify-end' : ''}`}
                            >
                                <span>{loc.label}</span>
                                {loc.locale === currentUiLang && <Icon icon="mdi:check" className="h-4 w-4 text-[var(--primary)]" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <NotificationBadge />
            </div>
        </header>
    );
}
