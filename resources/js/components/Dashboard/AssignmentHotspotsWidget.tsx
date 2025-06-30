import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, parseISO } from 'date-fns';
import { AcademicYearSharedData } from '@/types';
import React from 'react';

interface AssignmentHotspotsWidgetProps {
    heatmapData: { date: string; count: number }[];
    academicYear: AcademicYearSharedData | null;
    translations: any;
}

export default function AssignmentHotspotsWidget({ heatmapData, academicYear, translations }: AssignmentHotspotsWidgetProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.assignment_hotspots}</CardTitle>
            </CardHeader>
            <CardContent>
                {academicYear?.date_debut && academicYear?.date_fin ? (
                    <CalendarHeatmap
                        startDate={parseISO(academicYear.date_debut)}
                        endDate={parseISO(academicYear.date_fin)}
                        values={heatmapData}
                        classForValue={(value) => {
                            if (!value) return 'color-empty';
                            return `color-scale-${Math.min(value.count, 4)}`;
                        }}
                        gutterSize={1}
                        showWeekdayLabels={true}
                    />
                ) : (
                    <p className="text-muted-foreground">{translations.no_academic_year_dates}</p>
                )}
            </CardContent>
        </Card>
    );
}
