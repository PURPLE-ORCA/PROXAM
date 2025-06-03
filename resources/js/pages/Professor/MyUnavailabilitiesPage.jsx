import { Head, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';

export default function MyUnavailabilitiesPage({ unavailabilities }) {
    // Only page-specific props here
    const { props: sharedProps } = usePage(); // Access all props
    const { auth, academicYear } = sharedProps; // Destructure shared props
    const { translations } = useContext(TranslationContext);

    // Helper function to format datetime
    const formatDateTime = (datetimeString) => {
        if (!datetimeString) return '';
        const date = new Date(datetimeString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <AppLayout
            header={
                <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">
                    {translations?.myUnavailabilitiesPageTitle || 'My Unavailabilities'} ({academicYear.selected_annee || ''})
                </h2>
            }
        >
            <Head title={translations?.myUnavailabilitiesPageTitle || 'My Unavailabilities'} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-black">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                {translations?.infoUnavailabilitiesManagedByAdmin ||
                                    'These unavailabilities are managed by the administration. Please contact them for any changes.'}
                            </p>
                            {unavailabilities.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{translations?.tableHeaderStartDateTime || 'Start Date & Time'}</TableHead>
                                            <TableHead>{translations?.tableHeaderEndDateTime || 'End Date & Time'}</TableHead>
                                            <TableHead>{translations?.tableHeaderReason || 'Reason'}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {unavailabilities.map((unavailability) => (
                                            <TableRow key={unavailability.id}>
                                                <TableCell>{formatDateTime(unavailability.start_datetime)}</TableCell>
                                                <TableCell>{formatDateTime(unavailability.end_datetime)}</TableCell>
                                                <TableCell>{unavailability.reason}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>
                                    {translations?.noUnavailabilitiesForYear || 'No unavailabilities recorded for you in the selected academic year.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
