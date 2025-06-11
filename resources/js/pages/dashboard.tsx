import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { PageProps, Examen, Notification, Professeur } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'; // Assuming these are available from shadcn/ui

interface KpiData {
    totalActiveProfessors: number;
    totalExamsThisYear: number;
    totalAssignmentsThisYear: number;
    unstaffedExamsThisYear: number;
}

interface ProfessorLoadData {
    name: string;
    assignments: number;
}

interface RankDistributionData {
    rank: string;
    count: number;
    color: string;
}

interface DashboardProps extends PageProps {
    kpiData: KpiData;
    upcomingExams: (Examen & {
        module: { nom: string };
        salles: { nom: string }[];
        attributions_count: number;
        total_required_professors: number;
    })[];
    adminNotifications: (Notification & { link: string })[];
    professorLoadData: ProfessorLoadData[];
    rankDistributionData: RankDistributionData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { translations } = useContext(TranslationContext);
    const { kpiData, upcomingExams, adminNotifications, academicYear, professorLoadData, rankDistributionData } = usePage<DashboardProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* KPI Cards Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {translations.total_active_professors}
                            </CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.totalActiveProfessors}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {translations.total_exams_this_academic_year} ({academicYear?.annee_debut}-{academicYear?.annee_fin})
                            </CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.totalExamsThisYear}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {translations.total_assignments_this_academic_year} ({academicYear?.annee_debut}-{academicYear?.annee_fin})
                            </CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.totalAssignmentsThisYear}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-500 text-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {translations.unstaffed_exams_this_academic_year} ({academicYear?.annee_debut}-{academicYear?.annee_fin})
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.unstaffedExamsThisYear}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Upcoming Exams Widget */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>{translations.upcoming_exams}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingExams.length > 0 ? (
                                    upcomingExams.map((exam) => (
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

                    {/* Latest Admin Notifications Widget */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>{translations.latest_admin_notifications}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {adminNotifications.length > 0 ? (
                                    adminNotifications.map((notification) => (
                                        <Link key={notification.id} href={notification.link || '#'}>
                                            <div className="flex items-center gap-3">
                                                {notification.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                                                {notification.severity === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                                {notification.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                                                {notification.severity === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                                {!notification.severity && <Bell className="h-5 w-5 text-muted-foreground" />} {/* Default icon */}
                                                <div>
                                                    <p className="font-medium">{notification.title}</p>
                                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">{translations.no_new_notifications}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* New Charts Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {/* Professor Assignment Load Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>{translations.professor_assignment_load}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{
                                assignments: {
                                    label: translations.assignments,
                                    color: "hsl(var(--chart-1))",
                                },
                            }} className="aspect-auto h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={professorLoadData} margin={{ left: 100, right: 20 }}>
                                        <CartesianGrid horizontal={false} />
                                        <XAxis type="number" dataKey="assignments" />
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Bar dataKey="assignments" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Rank Distribution Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>{translations.professor_rank_distribution}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <ChartContainer config={{
                                count: {
                                    label: translations.count,
                                    color: "hsl(var(--chart-1))",
                                },
                            }} className="aspect-auto h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={rankDistributionData}
                                            dataKey="count"
                                            nameKey="rank"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            labelLine={false}
                                        >
                                            {rankDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {rankDistributionData.map((entry, index) => (
                                    <div key={`legend-${index}`} className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-sm text-muted-foreground">{entry.rank} ({entry.count})</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>{translations.quick_actions}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Link href={route('admin.examens.create')}>
                            <Button className="w-full">{translations.create_new_exam}</Button>
                        </Link>
                        <Link href={route('admin.professeurs.create')}>
                            <Button className="w-full">{translations.add_new_professor}</Button>
                        </Link>
                        <Link href={route('admin.unavailabilities.create')}>
                            <Button className="w-full">{translations.add_unavailability}</Button>
                        </Link>
                        <Link href={route('professeur.exchanges.index')}>
                            <Button className="w-full">{translations.view_exchange_requests}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
