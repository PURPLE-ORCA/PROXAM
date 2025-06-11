import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import React from 'react';

interface LastAssignmentRunSummary {
    run_at: string;
    seson_code: string;
    summary: string;
}

interface LastRunSummaryWidgetProps {
    summary: LastAssignmentRunSummary | null;
    translations: any;
}

export default function LastRunSummaryWidget({ summary, translations }: LastRunSummaryWidgetProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.last_assignment_run_summary}</CardTitle>
            </CardHeader>
            <CardContent>
                {summary ? (
                    <p className="text-muted-foreground">
                        {translations.last_run}: {format(parseISO(summary.run_at), 'PPP HH:mm')} {translations.for_session} '{summary.seson_code}'. {summary.summary}
                    </p>
                ) : (
                    <p className="text-muted-foreground">{translations.no_assignment_runs_recorded}</p>
                )}
            </CardContent>
        </Card>
    );
}
