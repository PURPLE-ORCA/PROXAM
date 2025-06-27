import React, { useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { TranslationContext } from '@/context/TranslationProvider';

export default function QuickLinksWidget() {
    const { translations } = useContext(TranslationContext);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{translations?.widgetQuickLinksTitle || 'Resources & Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link href={route('professeur.unavailabilities.index')} className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    {translations?.linkMyUnavailabilitiesDashboard || 'My Unavailabilities'}
                </Link>
                <div>
                    <h4 className="font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4 text-purple-500" />
                        {translations?.labelFacultyContactInfo || 'Faculty Exam Office:'}
                    </h4>
                    <p>exams@faculty.example | Ext: 123</p>
                </div>
            </CardContent>
        </Card>
    );
}
