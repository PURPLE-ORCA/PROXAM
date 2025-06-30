import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { Examen } from '@/types';
import React from 'react';

interface UpcomingExamsTimelineWidgetProps {
    timelineData: { [key: string]: (Examen & { module: { nom: string } })[] };
    translations: any;
}

export default function UpcomingExamsTimelineWidget({ timelineData, translations }: UpcomingExamsTimelineWidgetProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.upcoming_exams_timeline}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <div className="relative pl-6 space-y-6">
                        {Object.keys(timelineData).length > 0 ? (
                            Object.entries(timelineData).map(([date, exams]) => (
                                <div key={date} className="relative">
                                    <h4 className="text-lg font-semibold mb-2">
                                        {format(parseISO(date), 'PPP')} {/* e.g., July 24th, 2025 */}
                                    </h4>
                                    <ul className="space-y-2">
                                        {exams.map((exam) => (
                                            <li key={exam.id} className="relative flex items-start before:absolute before:left-[-22px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary after:absolute after:left-[-19px] after:top-4 after:h-[calc(100%-1rem)] after:w-px after:bg-border">
                                                <span className="ml-2 text-sm">
                                                    {format(new Date(exam.debut), 'HH:mm')} - {exam.module.nom}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">{translations.no_upcoming_exams_timeline}</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
