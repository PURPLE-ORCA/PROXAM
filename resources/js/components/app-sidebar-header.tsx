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

    return (
        <header className="border-sidebar-border/50 bg-background flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            {/* Left Side: Trigger and Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right Side: Search, Notifications, User Menu */}
            <div className="flex flex-1 items-center justify-end gap-4">
                {/* Search Input */}
                <div className="relative hidden w-full max-w-sm md:block">
                    <Icon icon="mdi:magnify" className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                    <Input placeholder="Search..." className="h-9 w-full pl-8" />
                </div>

                {/* Notification Button */}
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Icon icon="fa-solid:language" className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>

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
