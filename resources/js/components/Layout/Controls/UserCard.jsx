import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function UserCard({ user, translations }) {
    const getInitials = (name) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-md border p-2 text-left transition-colors hover:bg-muted">
                    <Avatar className="h-9 w-9 text-[var(--fmpo)]">
                        <AvatarImage src={user?.avatar} alt={user?.name || ''} />
                        <AvatarFallback>{user?.name ? getInitials(user.name) : <Icon icon="mdi:account" />}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                    <Link href={route('profile.edit')}>{translations?.profile_link || 'Profile'}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                        {translations?.logout_button || 'Log Out'}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
