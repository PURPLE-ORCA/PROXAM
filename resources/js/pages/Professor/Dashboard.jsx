import React, { useContext } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Calendar, Clock, Book, MapPin, Info } from 'lucide-react';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';

export default function Dashboard({ upcomingAssignments, totalAssignmentsThisYear }) {
    const { auth, academicYear } = usePage().props;
    const { translations } = useContext(TranslationContext);

    const professorName = auth.user.professeur?.nom_complet || auth.user.name;
    const selectedAcademicYear = academicYear.selected_annee;

    return (
        <AppLayout>
            <Head title={translations?.professorDashboardPageTitle || 'Professor Dashboard'} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Welcome Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>{translations?.widgetWelcomeProfessor?.replace('{name}', professorName) || `Welcome, Pr. ${professorName}!`}</CardTitle>
                        <CardDescription>{translations?.widgetAcademicYearContext?.replace('{academicYear}', selectedAcademicYear) || `Displaying data for: ${selectedAcademicYear}`}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This is your personalized dashboard. Here you can find a quick overview of your upcoming assignments and overall activity.</p>
                    </CardContent>
                </Card>

                {/* Upcoming Assignments Widget */}
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
                        <Link href={route('professeur.schedule.index')} as="button">
                            <Button>{translations?.linkViewFullSchedule || 'View Full Schedule'}</Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* Assignment Summary Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>{translations?.widgetActivitySummaryTitle || 'Activity Summary'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            {translations?.labelTotalAssignmentsForYear?.replace('{academicYear}', selectedAcademicYear) || `Total Assignments for ${selectedAcademicYear}:`}{' '}
                            <span className="font-bold text-purple-600">{totalAssignmentsThisYear}</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Quick Links / Info Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>{translations?.widgetQuickLinksTitle || 'Resources & Information'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href={route('professeur.unavailabilities.index')} as="button">
                            <Button className="w-full">{translations?.linkMyUnavailabilitiesDashboard || 'My Unavailabilities'}</Button>
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
            </div>
        </AppLayout>
    );
}
