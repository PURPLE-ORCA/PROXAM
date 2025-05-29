import React, { useContext, useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Calendar, Clock, Book, MapPin, Info, Bell } from 'lucide-react';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

export default function Dashboard({ upcomingAssignments, totalAssignmentsThisYear, pendingReviewRequests, pendingReviewRequestsCount, latestUnreadNotifications: initialLatestUnreadNotifications }) {
    const { auth, academicYear } = usePage().props;
    const { translations } = useContext(TranslationContext);
    const [latestNotifications, setLatestNotifications] = useState(initialLatestUnreadNotifications);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(route('notifications.markAsRead', notificationId));
            setLatestNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

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

                {/* My Pending Exchange Actions Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>{translations?.widgetPendingExchangeReviewsTitle || 'Pending Exchange Reviews'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingReviewRequestsCount > 0 ? (
                            <>
                                <p className="mb-4">
                                    {translations?.infoExchangeProposalsToReview?.replace('{count}', pendingReviewRequestsCount) || `You have ${pendingReviewRequestsCount} exchange proposals to review.`}
                                </p>
                                <ul className="space-y-2">
                                    {pendingReviewRequests.slice(0, 2).map((echange) => (
                                        <li key={echange.id} className="flex flex-col space-y-1">
                                            <span>
                                                {translations?.infoProposalFrom || 'Proposal from'}{' '}
                                                <span className="font-semibold">{echange.accepter.user.name}</span>{' '}
                                                {translations?.infoForYour || 'for your'}{' '}
                                                <span className="font-semibold">{echange.offered_attribution.examen.module.nom}</span>{' '}
                                                {translations?.infoExam || 'exam.'}
                                            </span>
                                            <Link href={route('professeur.exchanges.index', { tab: 'my-open-requests', highlight: echange.id })} as="button">
                                                <Button variant="outline" size="sm">{translations?.linkReviewProposal || 'Review Proposal'}</Button>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p>{translations?.infoNoExchangeProposalsToReview || 'No exchange proposals awaiting your review.'}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Notifications Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>{translations?.widgetRecentNotificationsTitle || 'Recent Notifications'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {latestNotifications.length > 0 ? (
                            <ul className="space-y-2">
                                {latestNotifications.map((notification) => (
                                    <li key={notification.id} className="flex items-start space-x-2">
                                        <Bell className="h-4 w-4 text-purple-500 mt-1" />
                                        <Link
                                            href={notification.link || '#'}
                                            onClick={() => markAsRead(notification.id)}
                                            className="flex-1 hover:underline"
                                        >
                                            <div>
                                                <p className="text-sm">{notification.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{translations?.infoNoNewUnreadNotifications || 'No new unread notifications.'}</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Link href={route('professeur.exchanges.index')} as="button">
                            <Button variant="link" className="p-0 h-auto">{translations?.linkViewAllNotifications || 'View All Notifications'}</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
