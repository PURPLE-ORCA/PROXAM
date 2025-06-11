import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';
import React from 'react';

interface KpiCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
    variant?: 'default' | 'destructive';
}

export default function KpiCard({ title, value, icon: Icon, description, variant = 'default' }: KpiCardProps) {
    const isDestructive = variant === 'destructive';
    return (
        <Card className={isDestructive ? 'border-red-500 text-red-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${isDestructive ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}
