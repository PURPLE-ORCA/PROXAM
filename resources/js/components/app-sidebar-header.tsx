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
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Icon } from '@iconify/react';
import { Link, usePage } from '@inertiajs/react';
// import NotificationBadge from '@/Components/NotificationBadge';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<{ auth: { user: { name: string; email: string; image?: string | null } } }>().props;
    const user = auth.user;

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const { translations, switchLanguage } = useContext(TranslationContext);
    const lang = localStorage.getItem('lang') || 'en';
    const locals = [
        {
            locale: 'en',
            label: 'English',
        },
        {
            locale: 'fr',
            label: 'Français',
        },
        {
            locale: 'ar',
            label: 'العربية',
        },
    ];

    return (
        <header className="border-sidebar-border/50 bg-background flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            {/* Left Side: Trigger and Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right Side: Search, Notifications, User Menu */}
            <div className="flex flex-1 items-center justify-end gap-4">

                {/* Notification Button */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="inline-flex items-center">
                            <Icon icon="fa-solid:language" className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {locals.map((pay) => (
                            <DropdownMenuItem
                                key={pay.locale}
                                onClick={() => switchLanguage(pay.locale)}
                                className={`flex items-center justify-between ${pay.locale === 'ar' ? 'font-arabic' : ''}`}
                            >
                                <span>{pay.label}</span>
                                {pay.locale === lang && <Icon icon="fa-solid:check" className="h-4 w-4 text-white" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notification Button */}
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Icon icon="mdi:bell-outline" className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* User Menu Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                                <AvatarFallback>
                                    {user.name ? getInitials(user.name) : <Icon icon="mdi:account" className="h-5 w-5" />}
                                </AvatarFallback>
                            </Avatar>
                            <span className="sr-only">User menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-muted-foreground text-xs">{user.email}</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {typeof route === 'function' && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')}>Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                                        Log Out
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
