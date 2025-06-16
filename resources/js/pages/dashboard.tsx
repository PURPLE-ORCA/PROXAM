import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, DashboardProps, Examen, Professeur, Notification } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell } from 'lucide-react';
import KpiCard from '@/components/Dashboard/KpiCard';
import UpcomingExamsWidget from '@/components/Dashboard/UpcomingExamsWidget';
import AdminNotificationsWidget from '@/components/Dashboard/AdminNotificationsWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import ProfessorLoadChart from '@/components/Dashboard/ProfessorLoadChart';
import RankDistributionChart from '@/components/Dashboard/RankDistributionChart';
import ServiceLoadChart from '@/components/Dashboard/ServiceLoadChart';
import RoomUtilizationChart from '@/components/Dashboard/RoomUtilizationChart';
import ExchangeSummaryWidget from '@/components/Dashboard/ExchangeSummaryWidget';
import RecentActivityWidget from '@/components/Dashboard/RecentActivityWidget';
import ExamTypeDistributionChart from '@/components/Dashboard/ExamTypeDistributionChart';
import UpcomingExamsTimelineWidget from '@/components/Dashboard/UpcomingExamsTimelineWidget';
import AssignmentHotspotsWidget from '@/components/Dashboard/AssignmentHotspotsWidget';
import LastRunSummaryWidget from '@/components/Dashboard/LastRunSummaryWidget';
import UnconfiguredProfessorsWidget from '@/components/Dashboard/UnconfiguredProfessorsWidget';
import QuickActionsWidget from '@/components/Dashboard/QuickActionsWidget';
import { Separator } from '@/components/ui/separator';
import 'react-calendar-heatmap/dist/styles.css';
import { formatDistanceToNow } from 'date-fns';
import { format, parseISO } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { translations } = useContext(TranslationContext);
    const {
        kpiData,
        upcomingExams,
        adminNotifications,
        academicYear,
        professorLoadData,
        rankDistributionData,
        serviceLoadData,
        roomUtilizationData,
        exchangeMetrics,
        recentRecords,
        examTypeDistribution,
        upcomingExamsForTimeline,
        assignmentHotspots,
        lastAssignmentRunSummary,
    } = usePage<DashboardProps>().props;

    const heatmapData = Object.entries(assignmentHotspots).map(([date, count]) => ({
        date,
        count,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <QuickActionsWidget translations={translations} />

                {/* KPI Cards Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KpiCard title={translations.total_active_professors} value={kpiData.totalActiveProfessors} icon={Bell} />
                    <KpiCard
                        title={translations.total_exams_this_academic_year}
                        value={kpiData.totalExamsThisYear}
                        icon={Bell}
                        description={`(${academicYear?.annee_debut}-${academicYear?.annee_fin})`}
                    />
                    <KpiCard
                        title={translations.total_assignments_this_academic_year}
                        value={kpiData.totalAssignmentsThisYear}
                        icon={Bell}
                        description={`(${academicYear?.annee_debut}-${academicYear?.annee_fin})`}
                    />
                    <KpiCard
                        title={translations.unstaffed_exams_this_academic_year}
                        value={kpiData.unstaffedExamsThisYear}
                        icon={AlertTriangle}
                        description={`(${academicYear?.annee_debut}-${academicYear?.annee_fin})`}
                        variant="destructive"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <UpcomingExamsWidget exams={upcomingExams} translations={translations} />

                    <AdminNotificationsWidget notifications={adminNotifications} translations={translations} />
                </div>

                {/* New Charts Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <ProfessorLoadChart data={professorLoadData} translations={translations} />

                    <RankDistributionChart data={rankDistributionData} translations={translations} />
                </div>

                {/* New Charts Row 2 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <ServiceLoadChart data={serviceLoadData} translations={translations} />

                    <RoomUtilizationChart data={roomUtilizationData} translations={translations} />
                </div>

                {/* New Widgets Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <ExchangeSummaryWidget metrics={exchangeMetrics} translations={translations} />

                    <RecentActivityWidget records={recentRecords} translations={translations} />
                </div>

                {/* New Widgets Row for V1.5 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <ExamTypeDistributionChart data={examTypeDistribution} translations={translations} />

                    <UpcomingExamsTimelineWidget timelineData={upcomingExamsForTimeline} translations={translations} />
                </div>

                {/* New Widgets Row 2 for V1.5 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <AssignmentHotspotsWidget heatmapData={heatmapData} academicYear={academicYear} translations={translations} />

                    <LastRunSummaryWidget summary={lastAssignmentRunSummary} translations={translations} />
                </div>

                {/* New Widgets Row 3 for V1.5 */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                    <UnconfiguredProfessorsWidget translations={translations} />
                </div>
            </div>
        </AppLayout>
    );
}
