import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Examen } from '@/types';
import React from 'react';

interface UpcomingExamsWidgetProps {
    exams: (Examen & {
        module: { nom: string };
        salles: { nom: string }[];
        attributions_count: number;
        total_required_professors: number;
    })[];
    translations: any;
}

export default function UpcomingExamsWidget({ exams, translations }: UpcomingExamsWidgetProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>{translations.upcoming_exams}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {exams.length > 0 ? (
                        exams.map((exam) => (
                            <div key={exam.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{exam.module.nom}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(exam.debut).toLocaleDateString()} - {new Date(exam.debut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={exam.attributions_count >= exam.total_required_professors ? 'default' : 'destructive'}>
                                        {exam.attributions_count}/{exam.total_required_professors} {translations.staffed}
                                    </Badge>
                                    <Link href={route('admin.examens.assignments.index', { examen: exam.id })}>
                                        <Button variant="outline" size="sm">{translations.manage}</Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">{translations.no_upcoming_exams}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
