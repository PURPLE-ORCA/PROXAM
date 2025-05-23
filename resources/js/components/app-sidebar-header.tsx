import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { TranslationContext } from '@/context/TranslationProvider';
import { type AnneeUniType, type PageProps } from '@/types'; // Ensure AnneeUniType is correct
import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react'; // router is needed
import { useContext } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth, academicYear, ziggy } = usePage<PageProps>().props;
    const user = auth.user;

    const { translations, switchLanguage } = useContext(TranslationContext);
    const currentUiLang = localStorage.getItem('lang') || 'en';

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
            router.post(
                route('admin.academic-year.select'),
                {
                    // Using POST as it changes server state (session)
                    annee_uni_id: yearId,
                },
                {
                    preserveScroll: true,
                    // preserveState: false, // Default for POST is false, which forces a fresh visit
                    // This is good as we want all data to reflect the new year.
                    onSuccess: () => {
                        // After the session is updated on the backend and Inertia reloads,
                        // the new academicYear prop will be available, and the page content
                        // (fetched by controllers using the new session value) will update.
                        // No need to explicitly call router.reload() here if using POST
                        // and preserveState is false (or default for POST).
                        // If you were using router.put or a GET request that doesn't fully reload,
                        // then router.reload() might be necessary.
                    },
                    onError: (errors) => {
                        console.error('Failed to switch academic year:', errors);
                        // Optionally show an error toast
                    },
                },
            );
        }
    };

    return (
        <header className="border-sidebar-border/50 bg-background flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1.5 md:-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex flex-1 items-center justify-end gap-1.5 md:gap-2">
                {academicYear && academicYear.all && academicYear.all.length > 0 && (
                    <Select
                        value={academicYear.selected_id?.toString() || ''}
                        onValueChange={handleAcademicYearChange} // This will now trigger the POST request
                    >
                        <SelectTrigger className="h-9 w-auto max-w-[200px] min-w-[150px] border-0 bg-transparent px-2 py-1.5 text-xs text-[var(--muted-foreground)] shadow-none hover:text-[var(--foreground)] focus:ring-0 md:text-sm">
                            <div className="flex items-center gap-1.5">
                                <Icon icon="mdi:calendar-blank-outline" className="h-4 w-4" />
                                <SelectValue placeholder={translations?.select_academic_year_placeholder || 'Select Year'} />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-72 min-w-[var(--radix-select-trigger-width)] border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                            {academicYear.all.map((year: AnneeUniType) => (
                                <SelectItem
                                    key={year.id}
                                    value={year.id.toString()}
                                    className="data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[var(--accent-foreground)]"
                                >
                                    {year.annee}
                                    {academicYear.current && year.id === academicYear.current.id && (
                                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                                            ({translations?.latest_year_indicator || 'Latest'})
                                        </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {(!academicYear || !academicYear.all || academicYear.all.length === 0) && academicYear?.selected_annee && (
                    <div className="hidden h-9 items-center gap-1.5 px-2 text-sm text-[var(--muted-foreground)] md:flex">
                        <Icon icon="mdi:calendar-blank-outline" className="h-4 w-4" />
                        <span>{academicYear.selected_annee}</span>
                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <Icon icon="fa-solid:language" className="h-4 w-4" />
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

                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Icon icon="mdi:bell-outline" className="h-5 w-5" />
                    <span className="sr-only">{translations?.notifications_sr || 'Notifications'}</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                            <Avatar className="h-8 w-8">
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
