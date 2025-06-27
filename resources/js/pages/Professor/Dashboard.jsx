import React, { useContext, useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import Masonry from 'react-masonry-css';

// Import the new widgets
import UserCard from '@/components/Layout/Controls/UserCard';
import UpcomingAssignmentsWidget from '@/components/Professor/DashboardWidgets/UpcomingAssignmentsWidget';
import ActivitySummaryWidget from '@/components/Professor/DashboardWidgets/ActivitySummaryWidget';
import PendingExchangeWidget from '@/components/Professor/DashboardWidgets/PendingExchangeWidget';
import QuickLinksWidget from '@/components/Professor/DashboardWidgets/QuickLinksWidget';
import RecentNotificationsWidget from '@/components/Professor/DashboardWidgets/RecentNotificationsWidget';

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

            {/* The new header section with UserCard and Welcome Widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Welcome Widget takes up 2/3 of the space */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{translations?.widgetWelcomeProfessor?.replace('{name}', professorName) || `Welcome, Pr. ${professorName}!`}</CardTitle>
                        <CardDescription>{translations?.widgetAcademicYearContext?.replace('{academicYear}', selectedAcademicYear) || `Displaying data for: ${selectedAcademicYear}`}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This is your personalized dashboard. Here you can find a quick overview of your upcoming assignments and overall activity.</p>
                    </CardContent>
                </Card>

                {/* The User Card takes up the remaining 1/3 */}
                <div className="flex items-center justify-center">
                    <UserCard user={auth.user} translations={translations} />
                </div>
            </div>

            {/* The Masonry Grid for the rest of the widgets */}
            <div className="p-6 pt-0 gap-4">
                <Masonry
                    breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    <UpcomingAssignmentsWidget upcomingAssignments={upcomingAssignments} translations={translations} />
                    <ActivitySummaryWidget totalAssignments={totalAssignmentsThisYear} academicYear={selectedAcademicYear} translations={translations} />
                    <PendingExchangeWidget requests={pendingReviewRequests} count={pendingReviewRequestsCount} translations={translations} />
                    <QuickLinksWidget translations={translations} />
                    <RecentNotificationsWidget notifications={latestNotifications} markAsRead={markAsRead} translations={translations} />
                </Masonry>
            </div>
        </AppLayout>
    );
}
