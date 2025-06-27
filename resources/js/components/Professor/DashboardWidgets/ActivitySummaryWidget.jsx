import React, { useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TranslationContext } from '@/context/TranslationProvider';

export default function ActivitySummaryWidget({ totalAssignmentsThisYear, academicYear }) {
    const { translations } = useContext(TranslationContext);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{translations?.widgetActivitySummaryTitle || 'Activity Summary'}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>
                    {translations?.labelTotalAssignmentsForYear?.replace('{academicYear}', academicYear) || `Total Assignments for ${academicYear}:`}{' '}
                    <span className="font-bold text-purple-600">{totalAssignmentsThisYear}</span>
                </p>
            </CardContent>
        </Card>
    );
}
