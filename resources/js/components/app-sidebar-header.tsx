import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    const handleAcademicYearChange = (yearIdString: string) => {
        const yearId = parseInt(yearIdString, 10);
        if (yearId && yearId !== academicYear.selected_id) {
            router.post(route('admin.academic-year.select'), { annee_uni_id: yearId }, { preserveScroll: true });
        }
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
                {academicYear && academicYear.all && academicYear.all.length > 0 && (
                    <Select value={academicYear.selected_id?.toString() || ''} onValueChange={handleAcademicYearChange}>
                        <SelectTrigger className="h-9 w-auto max-w-[200px] min-w-[150px] border-0 bg-transparent px-2 py-1.5 text-xs text-[var(--fmpo)] shadow-none hover:text-[var(--foreground)] focus:ring-0 md:text-sm">
                            <div className="flex items-center gap-1.5">
                                <Icon icon="mdi:calendar-blank-outline" className="h-4 w-4 text-[var(--fmpo)]" />
                                <SelectValue placeholder={translations?.select_academic_year_placeholder || 'Select Year'} />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-72 min-w-[var(--radix-select-trigger-width)] border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                            {academicYear.all.map((year) => (
                                <SelectItem key={year.id} value={year.id.toString()}>
                                    {year.annee}
                                    {academicYear.current && year.id === academicYear.current.id && (
                                        <span className="ml-2 text-xs text-[var(--fmpo)]">({translations?.latest_year_indicator || 'Latest'})</span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {(!academicYear || !academicYear.all || academicYear.all.length === 0) && academicYear?.selected_annee && (
                    <div className="hidden h-9 items-center gap-1.5 px-2 text-sm text-[var(--fmpo)] md:flex">
                        <Icon icon="mdi:calendar-blank-outline" className="h-4 w-4" />
                        <span>{academicYear.selected_annee}</span>
                    </div>
                )}

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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                            <Avatar className="h-8 w-8 text-[var(--fmpo)]">
                                <AvatarImage src={user?.avatar} alt={user?.name || ''} />
                                <AvatarFallback>{user?.name ? getInitials(user.name) : <Icon icon="mdi:account" />}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                        <DropdownMenuLabel>
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{user?.email}</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[var(--border)]" />
                        {ziggy && typeof route === 'function' && (
                            <>
                                <DropdownMenuItem
                                    asChild
                                    className="data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[var(--accent-foreground)]"
                                >
                                    <Link href={route('profile.edit')}>{translations?.profile_link || 'Profile'}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[var(--border)]" />
                                <DropdownMenuItem
                                    asChild
                                    className="data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[var(--accent-foreground)]"
                                >
                                    <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                                        {translations?.logout_button || 'Log Out'}
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
