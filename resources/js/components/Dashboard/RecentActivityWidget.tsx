import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

interface RecentRecord {
    type: string;
    name: string;
    created_at: string;
    action: string;
}

interface RecentActivityWidgetProps {
    records: RecentRecord[];
    translations: any;
}

export default function RecentActivityWidget({ records, translations }: RecentActivityWidgetProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.recently_added_records}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <div className="space-y-4 pr-4">
                        {records.length > 0 ? (
                            records.map((record, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{record.type}</Badge>
                                        <div>
                                            <p className="font-medium">{record.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {record.action} {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">{translations.no_recent_records}</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
