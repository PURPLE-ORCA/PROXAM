import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import React, { useContext } from 'react'; // Import useContext
import { TranslationContext } from '@/context/TranslationProvider'; // Import TranslationContext

export default function Dashboard({ auth, recentUnavailabilities, monthlyUnavailabilitiesCount }) {
    const { translations } = useContext(TranslationContext);

    return (
        <AppLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{translations?.rh_dashboard_page_title || 'Human Resources Dashboard'}</h2>}
        >
            <Head title={translations?.rh_dashboard_page_title || 'Human Resources Dashboard'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Welcome Widget */}
                        <Card className="col-span-full">
                            <CardHeader>
                                <CardTitle>{translations?.welcome_message?.replace('{name}', auth.user.name) || `Welcome, ${auth.user.name}!`} (Human Resources)</CardTitle>
                                <CardDescription>{translations?.welcome_rh_description || 'Manage professor unavailabilities and view related activities.'}</CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Quick Actions Widget */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{translations?.widget_quick_actions_title || 'Quick Actions'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link as="button" href={route('admin.unavailabilities.create')} className="w-full">
                                    <Button className="w-full">
                                        {translations?.button_add_unavailability || 'Add New Unavailability'}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Summary Widget */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{translations?.widget_activity_overview_title || 'Activity Overview'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{translations?.label_unavailabilities_this_month || 'Unavailabilities this month:'} {monthlyUnavailabilitiesCount}</p>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Widget */}
                        <Card className="md:col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>{translations?.widget_recent_activity_title || 'Recently Added Unavailabilities'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentUnavailabilities.length > 0 ? (
                                    <ul className="space-y-2">
                                        {recentUnavailabilities.map((unavailability) => (
                                            <li key={unavailability.id} className="text-sm">
                                                Prof. {unavailability.professeur.user.name} -{' '}
                                                {format(new Date(unavailability.start_datetime), 'PPP p')} to{' '}
                                                {format(new Date(unavailability.end_datetime), 'PPP p')}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{translations?.no_recent_unavailabilities || 'No recent unavailabilities found.'}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Link href={route('admin.unavailabilities.index')}>
                                    <Button variant="link">{translations?.view_all_unavailabilities || 'View All Unavailabilities'}</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
