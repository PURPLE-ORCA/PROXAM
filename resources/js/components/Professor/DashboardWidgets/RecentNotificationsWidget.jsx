import React, { useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { TranslationContext } from '@/context/TranslationProvider';
import { formatDistanceToNow } from 'date-fns';

export default function RecentNotificationsWidget({ notifications, markAsRead }) {
    const { translations } = useContext(TranslationContext);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{translations?.widgetRecentNotificationsTitle || 'Recent Notifications'}</CardTitle>
            </CardHeader>
            <CardContent>
                {notifications.length > 0 ? (
                    <ul className="space-y-2">
                        {notifications.map((notification) => (
                            <li key={notification.id} className="flex items-start space-x-2">
                                <Bell className="h-4 w-4 text-purple-500 mt-1" />
                                <Link
                                    href={notification.link || '#'}
                                    onClick={() => markAsRead(notification.id)}
                                    className="flex-1 hover:underline"
                                >
                                    <div>
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{translations?.infoNoNewUnreadNotifications || 'No new unread notifications.'}</p>
                )}
            </CardContent>
            <CardFooter>
                <Link href={route('professeur.exchanges.index')} className="p-0 h-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline">
                    {translations?.linkViewAllNotifications || 'View All Notifications'}
                </Link>
            </CardFooter>
        </Card>
    );
}
