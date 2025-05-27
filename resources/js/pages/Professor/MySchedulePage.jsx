import { Head } from '@inertiajs/react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'; 
import { useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';

export default function MySchedulePage({ auth, attributions, academicYear }) {
    const { translations } = useContext(TranslationContext);

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {translations?.myExamSchedulePageTitle || "My Exam Schedule"} ({academicYear.selected_annee || ''})
                </h2>
            }
        >
            <Head title={translations?.myExamSchedulePageTitle || "My Exam Schedule"} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {attributions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{translations?.tableHeaderDate || "Date"}</TableHead>
                                            <TableHead>{translations?.tableHeaderTime || "Time"}</TableHead>
                                            <TableHead>{translations?.tableHeaderDuration || "Duration"}</TableHead>
                                            <TableHead>{translations?.tableHeaderModule || "Module"}</TableHead>
                                            <TableHead>{translations?.tableHeaderRoom || "Room"}</TableHead>
                                            <TableHead>{translations?.tableHeaderRole || "Role"}</TableHead>
                                            <TableHead>{translations?.tableHeaderSession || "Session"}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attributions.map((attribution) => (
                                            <TableRow key={attribution.id}>
                                                <TableCell>{new Date(attribution.examen.debut).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(attribution.examen.debut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</TableCell>
                                                <TableCell>{"2 hours"}</TableCell> {/* Duration is hardcoded as "2 hours" */}
                                                <TableCell>{attribution.examen.module.nom}</TableCell>
                                                <TableCell>{attribution.salle.nom}</TableCell>
                                                <TableCell>{attribution.is_responsable ? (translations?.roleResponsable || "Responsable") : (translations?.roleInvigilator || "Invigilator")}</TableCell>
                                                <TableCell>{attribution.examen.seson.code}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>{translations?.noAssignmentsForYear || "No assignments found for the selected academic year."}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
