import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Info, CheckCircle, AlertTriangle, AlertCircle, Bell } from 'lucide-react';
import { Notification } from '@/types';
import React from 'react';

interface AdminNotificationsWidgetProps {
    notifications: (Notification & { link: string })[];
    translations: any;
}

export default function AdminNotificationsWidget({ notifications, translations }: AdminNotificationsWidgetProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>{translations.latest_admin_notifications}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <Link key={notification.id} href={notification.link || '#'}>
                                <div className="flex items-center gap-3">
                                    {notification.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                                    {notification.severity === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                    {notification.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                                    {notification.severity === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                    {!notification.severity && <Bell className="h-5 w-5 text-muted-foreground" />} {/* Default icon */}
                                    <div>
                                        <p className="font-medium">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-muted-foreground">{translations.no_new_notifications}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
