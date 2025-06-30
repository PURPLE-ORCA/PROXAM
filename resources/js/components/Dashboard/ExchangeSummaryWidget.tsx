import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import React from 'react';

interface ExchangeMetrics {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    mostActiveUsers: string[];
}

interface ExchangeSummaryWidgetProps {
    metrics: ExchangeMetrics;
    translations: any;
}

export default function ExchangeSummaryWidget({ metrics, translations }: ExchangeSummaryWidgetProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.exchange_system_summary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold">{metrics.totalRequests}</p>
                        <p className="text-sm text-muted-foreground">{translations.total_requests}</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-500">{metrics.approvedRequests}</p>
                        <p className="text-sm text-muted-foreground">{translations.approved_requests}</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-500">{metrics.rejectedRequests}</p>
                        <p className="text-sm text-muted-foreground">{translations.rejected_requests}</p>
                    </div>
                </div>
                <Separator />
                <div>
                    <h4 className="mb-2 text-lg font-semibold">{translations.most_active_exchange_users}</h4>
                    <div className="flex flex-wrap gap-2">
                        {metrics.mostActiveUsers.length > 0 ? (
                            metrics.mostActiveUsers.map((user, index) => (
                                <Badge key={index} variant="secondary">{user}</Badge>
                            ))
                        ) : (
                            <p className="text-muted-foreground">{translations.no_active_users}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
