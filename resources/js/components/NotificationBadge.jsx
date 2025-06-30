import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { BellIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { Badge } from './ui/badge';
import { toast } from 'sonner'; // Import toast from sonner

export default function NotificationBadge() {
    const [pendingCount, setPendingCount] = useState(0);
    const [latestNotifications, setLatestNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const countResponse = await axios.get(route('notifications.pendingCount'));
            setPendingCount(countResponse.data.count);

            const latestResponse = await axios.get(route('notifications.latest'));
            setLatestNotifications(latestResponse.data.notifications);
        } catch (error) {
        }
    };

    useEffect(() => {
        fetchNotifications(); // Initial fetch
        const interval = setInterval(fetchNotifications, 3000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const markAsRead = async (notificationId = null) => {
        try {
            const url = notificationId
                ? route('notifications.markRead', notificationId)
                : route('notifications.markRead');
            await axios.post(url);
            toast.success('Notification(s) marked as read.'); // Use sonner's toast.success
            fetchNotifications(); // Refresh counts and list
        } catch (error) {
            toast.error('Failed to mark notification as read.'); // Use sonner's toast.error
        }
    };

    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative">
                    <BellIcon className="h-6 w-6 text-[var(--fmpo)] " />
                    {pendingCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                            {pendingCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {latestNotifications.length > 0 ? (
                    <>
                        {latestNotifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="flex flex-col items-start space-y-1">
                                <Link
                                    href={notification.link || '#'}
                                    onClick={() => markAsRead(notification.id)}
                                    className="w-full"
                                >
                                    <p className="text-sm font-medium leading-none">{notification.type.replace(/_/g, ' ')}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center">
                            <Button variant="link" onClick={() => markAsRead()}>
                                Mark All As Read
                            </Button>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem>No new notifications.</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
