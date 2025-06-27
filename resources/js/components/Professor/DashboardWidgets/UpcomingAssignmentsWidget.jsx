import React, { useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, Book, MapPin } from 'lucide-react';
import { TranslationContext } from '@/context/TranslationProvider';

export default function UpcomingAssignmentsWidget({ upcomingAssignments }) {
    const { translations } = useContext(TranslationContext);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{translations?.widgetUpcomingAssignmentsTitle || 'Upcoming Assignments'}</CardTitle>
            </CardHeader>
            <CardContent>
                {upcomingAssignments.length > 0 ? (
                    <ul className="space-y-2">
                        {upcomingAssignments.map((attribution) => (
                            <li key={attribution.id} className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span>
                                    {new Date(attribution.examen.debut).toLocaleDateString()} -{' '}
                                    <Clock className="inline h-4 w-4 text-purple-500" />{' '}
                                    {new Date(attribution.examen.debut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <br />
                                    <Book className="inline h-4 w-4 text-purple-500" /> {attribution.examen.module.nom}
                                    <br />
                                    <MapPin className="inline h-4 w-4 text-purple-500" /> {attribution.salle.nom}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{translations?.infoNoUpcomingAssignmentsDashboard || 'No upcoming assignments.'}</p>
                )}
            </CardContent>
            <CardFooter>
                <Link href={route('professeur.schedule.index')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    {translations?.linkViewFullSchedule || 'View Full Schedule'}
                </Link>
            </CardFooter>
        </Card>
    );
}
